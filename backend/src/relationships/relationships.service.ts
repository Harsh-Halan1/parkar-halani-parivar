import { Injectable, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { CreateRelationshipDto, UpdateRelationshipDto } from './dto';

@Injectable()
export class RelationshipsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.relationship.findMany({
      include: {
        personA: true,
        personB: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const relationship = await this.prisma.relationship.findUnique({
      where: { id },
      include: {
        personA: true,
        personB: true,
      },
    });

    if (!relationship) {
      throw new NotFoundException('Relationship not found');
    }

    return relationship;
  }

  async create(data: CreateRelationshipDto, userId: string, userRole: Role) {
    // Validate persons exist
    const [personA, personB] = await Promise.all([
      this.prisma.person.findUnique({ where: { id: data.personAId } }),
      this.prisma.person.findUnique({ where: { id: data.personBId } }),
    ]);

    if (!personA || !personB) {
      throw new BadRequestException('One or both persons not found');
    }

    // Check permissions
    if (userRole !== Role.ADMIN) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { person: true },
      });

      const userFamilyId = user?.person?.familyId;
      if (!userFamilyId || 
          (personA.familyId !== userFamilyId && personB.familyId !== userFamilyId)) {
        throw new ForbiddenException('You can only create relationships within your family');
      }
    }

    return this.prisma.relationship.create({
      data: {
        personAId: data.personAId,
        personBId: data.personBId,
        relationType: data.relationType,
        marriageDate: data.marriageDate,
        divorceDate: data.divorceDate,
        adoptionDate: data.adoptionDate,
        isAdoptive: data.isAdoptive || false,
        biologicalParentAId: data.biologicalParentAId,
        biologicalParentBId: data.biologicalParentBId,
      },
      include: {
        personA: true,
        personB: true,
      },
    });
  }

  async findByPerson(personId: string) {
    return this.prisma.relationship.findMany({
      where: {
        OR: [
          { personAId: personId },
          { personBId: personId },
        ],
      },
      include: {
        personA: true,
        personB: true,
      },
    });
  }

  async findFamilyTree(familyId: string) {
    // Get all persons in family
    const persons = await this.prisma.person.findMany({
      where: { familyId },
      include: {
        relationshipsAsPersonA: {
          include: { personB: true },
        },
        relationshipsAsPersonB: {
          include: { personA: true },
        },
      },
    });

    return persons;
  }

  async update(id: string, data: UpdateRelationshipDto, userId: string, userRole: Role) {
    const relationship = await this.prisma.relationship.findUnique({
      where: { id },
      include: { personA: true, personB: true },
    });

    if (!relationship) {
      throw new NotFoundException('Relationship not found');
    }

    // Check permissions
    if (userRole !== Role.ADMIN) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { person: true },
      });

      const userFamilyId = user?.person?.familyId;
      if (!userFamilyId || 
          (relationship.personA.familyId !== userFamilyId && 
           relationship.personB.familyId !== userFamilyId)) {
        throw new ForbiddenException('You can only edit relationships within your family');
      }
    }

    return this.prisma.relationship.update({
      where: { id },
      data: {
        relationType: data.relationType,
        marriageDate: data.marriageDate,
        divorceDate: data.divorceDate,
        adoptionDate: data.adoptionDate,
        isAdoptive: data.isAdoptive,
        biologicalParentAId: data.biologicalParentAId,
        biologicalParentBId: data.biologicalParentBId,
      },
    });
  }

  async remove(id: string, userRole: Role) {
    if (userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can delete relationships');
    }

    return this.prisma.relationship.delete({
      where: { id },
    });
  }
}
