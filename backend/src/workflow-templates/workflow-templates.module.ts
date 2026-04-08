import { Module } from '@nestjs/common';
import { WorkflowTemplatesService } from './workflow-templates.service';
import { WorkflowTemplatesController } from './workflow-templates.controller';

@Module({
  providers: [WorkflowTemplatesService],
  controllers: [WorkflowTemplatesController],
  exports: [WorkflowTemplatesService],
})
export class WorkflowTemplatesModule {}
