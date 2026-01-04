import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        member: true,
        refreshTokens: false,
      },
    });
  }

  async getProfile(id: string) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        firstName: dto.firstName?.trim(),
        lastName: dto.lastName?.trim(),
        email: dto.email?.toLowerCase().trim(),
        phone: dto.phone?.trim(),
      },
      include: {
        member: true,
      },
    });
  }

  async linkMember(userId: string, memberId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const member = await this.prisma.member.findUnique({ where: { id: memberId } });
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (user.memberId) {
      throw new BadRequestException('User already linked to a member');
    }

    const existingLink = await this.prisma.user.findFirst({
      where: { memberId },
    });
    if (existingLink) {
      throw new BadRequestException('Member already linked to another user');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { memberId },
      include: { member: true },
    });
  }

  async unlinkMember(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.memberId) {
      throw new BadRequestException('User has no linked member');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { memberId: null },
    });
  }
}
