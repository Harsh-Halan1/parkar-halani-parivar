import { Body, Controller, Get, Param, Patch, Post, Delete, UseGuards } from '@nestjs/common';
import { UsersService, UpdateUserDto } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: User) {
    return this.users.getProfile(user.id);
  }

  @Get(':id')
  getProfile(@Param('id') id: string) {
    return this.users.getProfile(id);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    return this.users.updateProfile(user.id, dto);
  }

  @Patch(':id')
  updateProfile(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.users.updateProfile(id, dto);
  }

  @Post(':userId/link-member/:memberId')
  linkMember(@Param('userId') userId: string, @Param('memberId') memberId: string) {
    return this.users.linkMember(userId, memberId);
  }

  @Delete(':userId/unlink-member')
  unlinkMember(@Param('userId') userId: string) {
    return this.users.unlinkMember(userId);
  }
}
