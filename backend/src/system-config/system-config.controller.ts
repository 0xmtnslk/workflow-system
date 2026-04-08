import { Controller, Get, Patch, Post, Body, UseGuards } from '@nestjs/common';
import { SystemConfigService } from './system-config.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('system-config')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) {}

  @Get()
  getConfig() {
    return this.systemConfigService.getConfig();
  }

  @Patch()
  updateConfig(@Body() data: any) {
    return this.systemConfigService.updateConfig(data);
  }

  @Post('test')
  sendTestEmail(@Body('email') email: string) {
    return this.systemConfigService.sendTestEmail(email);
  }
}
