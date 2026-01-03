import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Member } from '@prisma/client';

export interface CreateMemberDto {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  profession?: string;
  maritalStatus?: string;
  photoUrl?: string;
}

export interface UpdateMemberDto extends Partial<CreateMemberDto> {}

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Member[]> {
    return this.prisma.member.findMany({
      include: {
        families: {
          include: { family: true },
        },
        user: true,
      },
    });
  }

  async findOne(id: string): Promise<Member | null> {
    return this.prisma.member.findUnique({
      where: { id },
      include: {
        families: {
          include: { family: true },
        },
        user: true,
        relationships: true,
        relatedFrom: true,
      },
    });
  }

  async create(dto: CreateMemberDto): Promise<Member> {
    return this.prisma.member.create({
      data: {
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        profession: dto.profession?.trim(),
        maritalStatus: dto.maritalStatus?.trim(),
        photoUrl: dto.photoUrl?.trim(),
      },
    });
  }

  async update(id: string, dto: UpdateMemberDto): Promise<Member> {
    return this.prisma.member.update({
      where: { id },
      data: {
        firstName: dto.firstName?.trim(),
        lastName: dto.lastName?.trim(),
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        profession: dto.profession?.trim(),
        maritalStatus: dto.maritalStatus?.trim(),
        photoUrl: dto.photoUrl?.trim(),
      },
    });
  }

  async remove(id: string): Promise<Member> {
    return this.prisma.member.delete({
      where: { id },
    });
  }

  async getMemberFamilies(memberId: string) {
    return this.prisma.familyMember.findMany({
      where: { memberId },
      include: {
        family: true,
      },
    });
  }

  async getRelationships(memberId: string) {
    return this.prisma.relationship.findMany({
      where: {
        OR: [
          { fromMemberId: memberId },
          { toMemberId: memberId },
        ],
      },
      include: {
        fromMember: true,
        toMember: true,
        family: true,
      },
    });
  }
}
