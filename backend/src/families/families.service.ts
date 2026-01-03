import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Family } from '@prisma/client';

export interface CreateFamilyDto {
  name: string;
  city?: string;
  description?: string;
}

export interface UpdateFamilyDto extends Partial<CreateFamilyDto> {}

@Injectable()
export class FamiliesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Family[]> {
    return this.prisma.family.findMany({
      include: {
        familyMembers: true,
        announcements: true,
      },
    });
  }

  async findOne(id: string): Promise<Family | null> {
    return this.prisma.family.findUnique({
      where: { id },
      include: {
        familyMembers: {
          include: { member: true },
        },
        announcements: true,
        relationships: true,
      },
    });
  }

  async create(dto: CreateFamilyDto): Promise<Family> {
    return this.prisma.family.create({
      data: {
        name: dto.name.trim(),
        city: dto.city?.trim(),
        description: dto.description?.trim(),
      },
    });
  }

  async update(id: string, dto: UpdateFamilyDto): Promise<Family> {
    return this.prisma.family.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        city: dto.city?.trim(),
        description: dto.description?.trim(),
      },
    });
  }

  async remove(id: string): Promise<Family> {
    return this.prisma.family.delete({
      where: { id },
    });
  }

  async addMember(familyId: string, memberId: string, relationshipType: string = 'Member') {
    return this.prisma.familyMember.create({
      data: {
        familyId,
        memberId,
        relationshipType,
      },
      include: {
        family: true,
        member: true,
      },
    });
  }

  async removeMember(familyId: string, memberId: string) {
    return this.prisma.familyMember.deleteMany({
      where: {
        familyId,
        memberId,
      },
    });
  }
}
