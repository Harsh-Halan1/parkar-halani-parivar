// File: backend/src/admin/admin.controller.ts

// Admin endpoints
import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators';
import { CurrentUser } from '@/auth/decorators';
import { Role } from '@prisma/client';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  /**
   * POST /admin/initial-setup
   * Create initial admin account
   * Call this only once during first setup
   */
  @Post('initial-setup')
  async createInitialAdmin(
    @Body() dto: { email: string; phone: string; password: string }
  ) {
    if (!dto.email || !dto.phone || !dto.password) {
      throw new BadRequestException('Email, phone, and password are required');
    }

    if (dto.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    return this.adminService.createInitialAdmin(
      dto.email,
      dto.phone,
      dto.password
    );
  }

  /**
   * POST /admin/moderators/:userId
   * Grant moderation permissions to a user
   * Requires: Admin role
   */
  @Post('moderators/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async grantModeration(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: any
  ) {
    return this.adminService.grantModerationPermission(currentUser.id, userId);
  }

  /**
   * DELETE /admin/moderators/:userId
   * Revoke moderation permissions from a user
   * Requires: Admin role
   */
  @Delete('moderators/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async revokeModeration(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: any
  ) {
    return this.adminService.revokeModerationPermission(currentUser.id, userId);
  }

  /**
   * GET /admin/moderators
   * List all moderators/admins
   * Requires: Admin role
   */
  @Get('moderators')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async listModerators() {
    return this.adminService.listModerators();
  }

  /**
   * GET /admin/moderation-logs
   * Get moderation audit logs
   * Requires: Admin role
   */
  @Get('moderation-logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getModerationLogs(
    @Query('limit') limit: string = '50',
    @Query('offset') offset: string = '0'
  ) {
    return this.adminService.getModerationLogs(
      parseInt(limit),
      parseInt(offset)
    );
  }
}
