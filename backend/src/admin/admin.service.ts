// File: backend/src/admin/admin.service.ts
// Admin moderation and permission management

import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create initial admin account during first setup
   * Should only be callable once - checks if any admin exists
   */
  async createInitialAdmin(email: string, phone: string, password: string) {
    const existingAdmin = await this.prisma.user.findFirst({
      where: { role: Role.ADMIN },
    });

    if (existingAdmin) {
      throw new BadRequestException(
        'Admin account already exists. Cannot create another admin.'
      );
    }

    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 12);

    const adminUser = await this.prisma.user.create({
      data: {
        email,
        phone,
        passwordHash: hashedPassword,
        role: Role.ADMIN,
        isEmailVerified: true,
        isPhoneVerified: true,
        consentGiven: true,
        consentDate: new Date(),
      },
    });

    return {
      id: adminUser.id,
      email: adminUser.email,
      phone: adminUser.phone,
      role: adminUser.role,
      message: 'Admin account created successfully',
    };
  }

  /**
   * Promote a family member account to moderator
   * Only existing FAMILY_MEMBER accounts can be promoted
   */
  async grantModerationPermission(
    adminId: string,
    targetUserId: string
  ) {
    // Verify requestor is admin
    const requestor = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!requestor || requestor.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can grant moderation permissions');
    }

    // Verify target user exists and is FAMILY_MEMBER
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      include: { person: true },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    if (targetUser.role !== Role.FAMILY_MEMBER) {
      throw new BadRequestException(
        'Only family members can be granted moderation permissions'
      );
    }

    // Check if user is already an admin or moderator
    // (In this design, we use ADMIN role for both admins and moderators)
    // Alternatively, you could add a "permissions" JSONB field

    // Grant moderation permission
    const updatedUser = await this.prisma.user.update({
      where: { id: targetUserId },
      data: {
        role: Role.ADMIN, // Upgraded to admin/moderator
      },
      include: { person: true },
    });

    // Log this action
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'GRANT_MODERATION',
        entity: 'USER',
        entityId: targetUserId,
        newData: {
          previousRole: Role.FAMILY_MEMBER,
          newRole: Role.ADMIN,
        },
      },
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      person: updatedUser.person,
      message: 'Moderation permission granted successfully',
    };
  }

  /**
   * Revoke moderation permissions (demote back to family member)
   */
  async revokeModerationPermission(
    adminId: string,
    targetUserId: string
  ) {
    // Verify requestor is admin
    const requestor = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!requestor || requestor.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can revoke permissions');
    }

    // Verify target exists and is current admin
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    if (targetUser.role !== Role.ADMIN) {
      throw new BadRequestException('User does not have moderation permissions');
    }

    // Prevent revoking from last admin
    const adminCount = await this.prisma.user.count({
      where: { role: Role.ADMIN },
    });

    if (adminCount === 1) {
      throw new BadRequestException(
        'Cannot revoke permission from the last admin account'
      );
    }

    // Revoke moderation
    const updatedUser = await this.prisma.user.update({
      where: { id: targetUserId },
      data: {
        role: Role.FAMILY_MEMBER,
      },
      include: { person: true },
    });

    // Log this action
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'REVOKE_MODERATION',
        entity: 'USER',
        entityId: targetUserId,
        newData: {
          previousRole: Role.ADMIN,
          newRole: Role.FAMILY_MEMBER,
        },
      },
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      person: updatedUser.person,
      message: 'Moderation permission revoked successfully',
    };
  }

  /**
   * List all moderators/admins
   */
  async listModerators() {
    const moderators = await this.prisma.user.findMany({
      where: { role: Role.ADMIN },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        person: true,
        createdAt: true,
      },
    });

    return moderators;
  }

  /**
   * Get moderation audit logs
   */
  async getModerationLogs(
    limit: number = 50,
    offset: number = 0
  ) {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        action: {
          in: ['GRANT_MODERATION', 'REVOKE_MODERATION'],
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await this.prisma.auditLog.count({
      where: {
        action: {
          in: ['GRANT_MODERATION', 'REVOKE_MODERATION'],
        },
      },
    });

    return {
      data: logs,
      total,
      limit,
      offset,
    };
  }
}
