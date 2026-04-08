import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, TemplateStatus } from '@prisma/client';

@Injectable()
export class WorkflowTemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(status?: TemplateStatus) {
    return this.prisma.workflowTemplate.findMany({
      where: status ? { status } : {},
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.workflowTemplate.findUnique({
      where: { id },
      include: {
        steps: {
          include: {
            tasks: {
              orderBy: { order: 'asc' },
            },
            dependsOn: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Şablon bulunamadı');
    }

    return template;
  }

  async saveTemplate(data: any) {
    const { id, name, description, status, steps, parameters } = data;

    // Use a transaction to ensure atomic updates
    return this.prisma.$transaction(async (tx) => {
      let template;

      if (id && id !== 'new') {
        // Update existing template
        template = await tx.workflowTemplate.update({
          where: { id },
          data: { name, description, status, parameters },
        });

        // 1. Delete all existing steps (and tasks will cascade if defined in schema, 
        // but let's be explicit if needed. Prisma schema uses default cascade usually).
        // Actually, we should handle dependencies carefully.
        
        // Let's delete steps for this template. 
        // NOTE: In a real prod app, we might want to version templates instead of deleting.
        await tx.step.deleteMany({ where: { workflowTemplateId: id } });
      } else {
        // Create new template
        template = await tx.workflowTemplate.create({
          data: { name, description, status, parameters },
        });
      }

      // 2. Create new steps and map their temporary IDs to new database IDs for dependencies
      const idMap = new Map<string, string>();

      for (const stepData of steps) {
        const newStep = await tx.step.create({
          data: {
            workflowTemplateId: template.id,
            name: stepData.name,
            order: stepData.order,
            duration: stepData.duration || 1,
            assignedDepartmentId: stepData.assignedDepartmentId,
            positionX: stepData.positionX,
            positionY: stepData.positionY,
            tasks: {
              create: stepData.tasks?.map((t: any) => ({
                label: t.label,
                type: t.type,
                order: t.order,
                isRequired: t.isRequired ?? true,
              })),
            },
          },
        });
        idMap.set(stepData.id, newStep.id);
      }

      // 3. Connect dependencies
      for (const stepData of steps) {
        if (stepData.dependencies && stepData.dependencies.length > 0) {
          const targetStepId = idMap.get(stepData.id);
          for (const depId of stepData.dependencies) {
            const sourceStepId = idMap.get(depId);
            if (sourceStepId && targetStepId) {
              await tx.step.update({
                where: { id: targetStepId },
                data: {
                  dependsOn: {
                    connect: { id: sourceStepId },
                  },
                },
              });
            }
          }
        }
      }

      return this.findOne(template.id);
    });
  }

  async delete(id: string) {
    return this.prisma.workflowTemplate.delete({
      where: { id },
    });
  }
}
