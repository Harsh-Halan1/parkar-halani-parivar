import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Relationship } from '@prisma/client';

export interface CreateRelationshipDto {
  fromMemberId: string;
  toMemberId: string;
  familyId: string;
  type: string;
}

export interface UpdateRelationshipDto extends Partial<CreateRelationshipDto> {}

@Injectable()
export class RelationshipsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Relationship[]> {
    return this.prisma.relationship.findMany({
      include: {
        fromMember: true,
        toMember: true,
        family: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Relationship | null> {
    return this.prisma.relationship.findUnique({
      where: { id },
      include: {
        fromMember: true,
        toMember: true,
        family: true,
      },
    });
  }

  async findByMember(memberId: string): Promise<Relationship[]> {
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateRelationshipDto): Promise<Relationship> {
    this.validateCreate(dto);
    try {
      return await this.prisma.relationship.create({
        data: {
          fromMemberId: dto.fromMemberId,
          toMemberId: dto.toMemberId,
          familyId: dto.familyId,
          type: dto.type.trim(),
        },
        include: {
          fromMember: true,
          toMember: true,
          family: true,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  async update(id: string, dto: UpdateRelationshipDto): Promise<Relationship> {
    await this.ensureExists(id);
    try {
      return await this.prisma.relationship.update({
        where: { id },
        data: {
          fromMemberId: dto.fromMemberId,
          toMemberId: dto.toMemberId,
          familyId: dto.familyId,
          type: dto.type?.trim(),
        },
        include: {
          fromMember: true,
          toMember: true,
          family: true,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  async remove(id: string): Promise<Relationship> {
    await this.ensureExists(id);
    return this.prisma.relationship.delete({
      where: { id },
    });
  }

  private async ensureExists(id: string) {
    const existing = await this.prisma.relationship.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Relationship with ID ${id} not found`);
    }
  }

  private validateCreate(dto: CreateRelationshipDto) {
    const trimmedType = dto.type?.trim();
    if (!dto.fromMemberId || !dto.toMemberId || !dto.familyId || !trimmedType) {
      throw new BadRequestException('fromMemberId, toMemberId, familyId, and type are required');
    }
    if (dto.fromMemberId === dto.toMemberId) {
      throw new BadRequestException('fromMemberId and toMemberId cannot be the same');
    }
  }

  private handlePrismaError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException('This relationship already exists for the given family');
    }
  }
}
