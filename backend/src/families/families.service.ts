import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { CreateFamilyDto, UpdateFamilyDto } from './dto';

@Injectable()
export class FamiliesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateFamilyDto, userId: string, userRole: Role) {
    // Only admins can create families
    if (userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can create families');
    }

    return this.prisma.family.create({
      data: {
        name: data.name as any, // Prisma stores JSON directly
      },
    });
  }

  async findAll() {
    return this.prisma.family.findMany({
      include: {
        members: true,
      },
    });
  }

  async findOne(id: string) {
    const family = await this.prisma.family.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!family) {
      throw new NotFoundException('Family not found');
    }

    return family;
  }

  async update(id: string, data: UpdateFamilyDto, userId: string, userRole: Role) {
    const family = await this.prisma.family.findUnique({
      where: { id },
    });

    if (!family) {
      throw new NotFoundException('Family not found');
    }
    // Check permissions
    if (userRole !== Role.ADMIN) {
      // Family members can only update their own family
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { person: true },
      });

      if (!user?.person || user.person.familyId !== id) {
        throw new ForbiddenException('You can only edit your own family');
      }
    }

    return this.prisma.family.update({
      where: { id },
      data: {
        name: data.name ? (data.name as any) : undefined,
        headPersonId: data.headPersonId,
      },
    });
  }

  async remove(id: string, userRole: Role) {
    if (userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can delete families');
    }

    return this.prisma.family.delete({
      where: { id },
    });
  }
}
