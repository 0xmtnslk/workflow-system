import { Module } from '@nestjs/common';
import { WorkflowInstanceService } from './workflow-instance.service';
import { WorkflowInstanceController } from './workflow-instance.controller';
import { BullModule } from '@nestjs/bullmq';
import { WorkflowChecksProcessor } from './processors/workflow-checks.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'workflow-checks',
    }),
  ],
  providers: [WorkflowInstanceService, WorkflowChecksProcessor],
  controllers: [WorkflowInstanceController],
  exports: [WorkflowInstanceService],
})
export class WorkflowsModule {}
