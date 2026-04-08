import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Patch, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { WorkflowInstanceService } from './workflow-instance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('workflow-instances')
@UseGuards(JwtAuthGuard)
export class WorkflowInstanceController {
  constructor(private readonly service: WorkflowInstanceService) {}

  @Post('start')
  start(@Request() req: any, @Body() data: { templateId: string, parameters: any }) {
    return this.service.instantiate(data.templateId, req.user.id, data.parameters);
  }

  @Get()
  findAll(@Request() req: any) {
    // Basic role check could be added here to see all or only own
    return this.service.findAll(req.user.role === 'WORKER' ? req.user.id : undefined);
  }

  @Get('tasks/my')
  getMyTasks(@Request() req: any) {
    return this.service.getMyTasks(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch('tasks/:id/claim')
  claim(@Request() req: any, @Param('id') id: string) {
    return this.service.claimTask(id, req.user.id);
  }

  @Patch('tasks/:id/unassign')
  unassign(@Request() req: any, @Param('id') id: string) {
    return this.service.unassignTask(id, req.user.id);
  }

  @Post('tasks/:id/complete')
  complete(@Request() req: any, @Param('id') id: string, @Body() body: { responses: any[] }) {
    return this.service.completeStep(id, req.user.id, body.responses);
  }
}
