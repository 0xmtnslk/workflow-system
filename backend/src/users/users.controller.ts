import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @Roles(Role.SUPER_ADMIN)
  create(@Body() data: any) {
    // data: { name, email, passwordHash (clear text from form), role, departmentId }
    return this.usersService.create(data);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() data: any) {
    return this.usersService.update(id, data);
  }

  @Post(':id/reset-password')
  @Roles(Role.SUPER_ADMIN)
  resetPassword(@Param('id') id: string, @Body('password') password: string) {
    return this.usersService.resetPassword(id, password);
  }

  @Post('change-password')
  changeOwnPassword(@Request() req: any, @Body('password') password: string) {
    return this.usersService.changeOwnPassword(req.user.id || req.user.sub, password);
  }

  @Get('me')
  getMe(@Request() req: any) {
    return this.usersService.findOneById(req.user.id || req.user.sub);
  }
}
