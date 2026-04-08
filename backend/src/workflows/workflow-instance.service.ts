import { Injectable, NotFoundException, BadRequestException, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { InstanceStatus, StepStatus } from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class WorkflowInstanceService implements OnModuleInit {
  private readonly logger = new Logger(WorkflowInstanceService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    @InjectQueue('workflow-checks') private readonly checksQueue: Queue
  ) {}

  async onModuleInit() {
    await this.checksQueue.add(
      'check-overdue',
      {},
      {
        repeat: {
          pattern: '0 * * * *', // Every hour
        },
      },
    );
    this.logger.log('Repeatable job "check-overdue" scheduled.');
  }

  /**
   * Start a new workflow instance from a template
   */
  async instantiate(templateId: string, userId: string, parameters: any) {
    const template = await this.prisma.workflowTemplate.findUnique({
      where: { id: templateId, status: 'ACTIVE' },
      include: { steps: { include: { dependsOn: true } } },
    });

    if (!template) {
      throw new NotFoundException('Aktif şablon bulunamadı');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Workflow Instance
      const instance = await tx.workflowInstance.create({
        data: {
          templateId,
          triggeredByUserId: userId,
          parameters,
          status: InstanceStatus.RUNNING,
        },
      });

      // 2. Identify initial steps (those with no dependencies)
      const initialSteps = template.steps.filter(s => s.dependsOn.length === 0);

      // 3. Create Step Instances for initial steps
      for (const step of initialSteps) {
        const dueAt = new Date();
        dueAt.setDate(dueAt.getDate() + (step.duration || 1));

        await tx.stepInstance.create({
          data: {
            workflowInstanceId: instance.id,
            stepId: step.id,
            status: StepStatus.IN_PROGRESS, // First steps start immediately
            dueAt,
          },
        });

        // 4. Notify department
        if (step.assignedDepartmentId) {
          // We'll trigger notifications after transaction or via service
          // For now, let's use the service (notifying inside tx is generally okay for non-critical systems)
          await this.notifications.sendToDepartment(
            step.assignedDepartmentId,
            'Yeni Görev',
            `"${template.name}" süreci için yeni bir görev ("${step.name}") biriminize atandı.`,
            instance.id
          );
        }
      }

      return instance;
    });
  }

  async findAll(userId?: string) {
    return this.prisma.workflowInstance.findMany({
      where: userId ? { triggeredByUserId: userId } : {},
      include: {
        template: true,
        triggeredBy: { select: { name: true, email: true } },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.workflowInstance.findUnique({
      where: { id },
      include: {
        template: true,
        triggeredBy: { select: { name: true, email: true } },
        stepInstances: {
          include: {
            step: true,
            assignedUser: { select: { name: true } },
            taskResponses: {
              include: { 
                task: true,
                respondedBy: { select: { name: true } }
              }
            }
          },
          orderBy: { startedAt: 'asc' }
        }
      }
    });
  }

  async getMyTasks(userId: string) {
    if (!userId) {
      throw new BadRequestException('Kullanıcı kimliği eksik.');
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    return this.prisma.stepInstance.findMany({
      where: {
        status: { in: [StepStatus.WAITING, StepStatus.IN_PROGRESS] },
        OR: [
          { assignedUserId: userId }, // Assigned to me
          { 
            assignedUserId: null, 
            step: { assignedDepartmentId: user.departmentId } 
          } // Unassigned but in my department
        ]
      },
      include: {
        workflowInstance: {
          include: { template: true, triggeredBy: { select: { name: true } } }
        },
        step: {
          include: { tasks: { orderBy: { order: 'asc' } } }
        }
      },
      orderBy: { dueAt: 'asc' }
    });
  }

  async claimTask(stepInstanceId: string, userId: string) {
    const stepInstance = await this.prisma.stepInstance.findUnique({
      where: { id: stepInstanceId },
      include: { step: true }
    });

    if (!stepInstance) throw new NotFoundException('Görev bulunamadı');
    if (stepInstance.assignedUserId) throw new BadRequestException('Bu görev zaten bir başkası tarafından üstlenilmiş');

    return this.prisma.stepInstance.update({
      where: { id: stepInstanceId },
      data: { 
        assignedUserId: userId,
        status: StepStatus.IN_PROGRESS,
        startedAt: new Date()
      }
    });
  }

  async unassignTask(stepInstanceId: string, userId: string) {
    const stepInstance = await this.prisma.stepInstance.findUnique({
      where: { id: stepInstanceId }
    });

    if (!stepInstance) throw new NotFoundException('Görev bulunamadı');
    if (stepInstance.assignedUserId !== userId) throw new BadRequestException('Sadece görevi üstlenen kişi işlemi geri alabilir');

    return this.prisma.stepInstance.update({
      where: { id: stepInstanceId },
      data: { assignedUserId: null }
    });
  }

  async completeStep(stepInstanceId: string, userId: string, responses: any[]) {
    return this.prisma.$transaction(async (tx) => {
      const stepInstance = await tx.stepInstance.findUnique({
        where: { id: stepInstanceId },
        include: { 
          step: { include: { tasks: true } },
          workflowInstance: { include: { template: true } }
        }
      });

      if (!stepInstance) throw new NotFoundException('Görev bulunamadı');
      if (stepInstance.assignedUserId !== userId) throw new BadRequestException('Görevi tamamlamak için önce üstlenmeniz gerekir');
      if (stepInstance.status === StepStatus.COMPLETED) throw new BadRequestException('Görev zaten tamamlanmış');

      // 1. Save Task Responses
      for (const resp of responses) {
        await tx.taskResponse.create({
          data: {
            stepInstanceId,
            taskId: resp.taskId,
            responseValue: resp.value,
            respondedByUserId: userId
          }
        });
      }

      // 2. Mark Step as Completed
      await tx.stepInstance.update({
        where: { id: stepInstanceId },
        data: { 
          status: StepStatus.COMPLETED,
          completedAt: new Date()
        }
      });

      // 3. Propagation Logic: Find subsequent steps
      const successors = await tx.step.findMany({
        where: { dependsOn: { some: { id: stepInstance.stepId } } },
        include: { dependsOn: true }
      });

      for (const successor of successors) {
        // Check if all dependencies are satisfied
        const dependencies = successor.dependsOn;
        const depIds = dependencies.map(d => d.id);
        
        const completedDepsCount = await tx.stepInstance.count({
          where: {
            workflowInstanceId: stepInstance.workflowInstanceId,
            stepId: { in: depIds },
            status: StepStatus.COMPLETED
          }
        });

        if (completedDepsCount === depIds.length) {
          // All dependencies met! Create instance for successor
          const dueAt = new Date();
          dueAt.setDate(dueAt.getDate() + (successor.duration || 1));

          await tx.stepInstance.create({
            data: {
              workflowInstanceId: stepInstance.workflowInstanceId,
              stepId: successor.id,
              status: StepStatus.IN_PROGRESS,
              dueAt
            }
          });

          // Notify successor department
          if (successor.assignedDepartmentId) {
             await this.notifications.sendToDepartment(
              successor.assignedDepartmentId,
              'Yeni Görev',
              `"${stepInstance.workflowInstance.template.name}" süreci için yeni bir görev ("${successor.name}") biriminize atandı.`,
              stepInstance.workflowInstanceId
            );
          }
        }
      }

      // 4. Check if entire workflow is completed
      const pendingSteps = await tx.stepInstance.count({
        where: { 
          workflowInstanceId: stepInstance.workflowInstanceId,
          status: { not: StepStatus.COMPLETED }
        }
      });

      if (pendingSteps === 0) {
        await tx.workflowInstance.update({
          where: { id: stepInstance.workflowInstanceId },
          data: { 
            status: InstanceStatus.COMPLETED,
            completedAt: new Date()
          }
        });

        // Notify Initiator
        await this.notifications.create(
          stepInstance.workflowInstance.triggeredByUserId,
          'Süreç Tamamlandı',
          `"${stepInstance.workflowInstance.template.name}" süreci başarıyla tamamlanmıştır.`,
          stepInstance.workflowInstanceId
        );
      }

      return { success: true };
    });
  }
}
