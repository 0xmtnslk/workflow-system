import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  Query, 
  UseGuards 
} from '@nestjs/common';
import { WorkflowTemplatesService } from './workflow-templates.service';
import { TemplateStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('workflow-templates')
@UseGuards(JwtAuthGuard)
export class WorkflowTemplatesController {
  constructor(private readonly service: WorkflowTemplatesService) {}

  @Get()
  findAll(@Query('status') status?: TemplateStatus) {
    return this.service.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  save(@Body() data: any) {
    return this.service.saveTemplate(data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
