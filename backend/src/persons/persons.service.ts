import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ImageService } from '../shared/image.service';
import { Role, MaritalStatus } from '@prisma/client';
import { CreatePersonDto, UpdatePersonDto, PersonFilterDto } from './dto';

@Injectable()
export class PersonsService {
  constructor(
    private prisma: PrismaService,
    private imageService: ImageService,
  ) {}

  async create(data: CreatePersonDto, userId: string, userRole: Role) {
    // Check if user can create person in this family
    if (userRole !== Role.ADMIN) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { person: true },
      });

      if (!user?.person || user.person.familyId !== data.familyId) {
        throw new ForbiddenException('You can only add persons to your own family');
      }
    }

    return this.prisma.person.create({
      data: {
        familyId: data.familyId,
        firstName: data.firstName ? (data.firstName as any) : {},
        middleName: data.middleName ? (data.middleName as any) : undefined,
        lastName: data.lastName ? (data.lastName as any) : {},
        gender: (data.gender as any) || 'OTHER',
        dateOfBirth: data.dateOfBirth,
        placeOfBirth: data.placeOfBirth ? (data.placeOfBirth as any) : undefined,
        email: data.email,
        phone: data.phone,
        residentialAddress: data.residentialAddress ? (data.residentialAddress as any) : undefined,
        professionalAddress: data.professionalAddress ? (data.professionalAddress as any) : undefined,
        occupation: data.occupation ? (data.occupation as any) : undefined,
        company: data.company ? (data.company as any) : undefined,
        maritalStatus: data.maritalStatus || 'SINGLE',
        photoUrl: data.photoUrl,
        bio: data.bio ? (data.bio as any) : undefined,
      },
      include: { family: true },
    });
  }

  async findAll(filters?: PersonFilterDto) {
    const where: Record<string, any> = {};

    if (filters?.maritalStatus) {
      where.maritalStatus = filters.maritalStatus;
    }

    return this.prisma.person.findMany({
      where,
      include: {
        family: true,
      },
    });
  }

  async findOne(id: string) {
    const person = await this.prisma.person.findUnique({
      where: { id },
      include: {
        family: true,
        relationshipsAsPersonA: {
          include: { personB: true },
        },
        relationshipsAsPersonB: {
          include: { personA: true },
        },
      },
    });

    if (!person) {
      throw new NotFoundException('Person not found');
    }

    return person;
  }

  async update(id: string, data: UpdatePersonDto, userId: string, userRole: Role) {
    const person = await this.prisma.person.findUnique({
      where: { id },
    });

    if (!person) {
      throw new NotFoundException('Person not found');
    }

    // Check permissions
    if (userRole !== Role.ADMIN) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { person: true },
      });

      if (!user?.person || user.person.familyId !== person.familyId) {
        throw new ForbiddenException('You can only edit persons in your own family');
      }
    }

    return this.prisma.person.update({
      where: { id },
      data: {
        firstName: data.firstName ? (data.firstName as any) : undefined,
        middleName: data.middleName ? (data.middleName as any) : undefined,
        lastName: data.lastName ? (data.lastName as any) : undefined,
        gender: data.gender ? (data.gender as any) : undefined,
        dateOfBirth: data.dateOfBirth,
        placeOfBirth: data.placeOfBirth ? (data.placeOfBirth as any) : undefined,
        email: data.email,
        phone: data.phone,
        residentialAddress: data.residentialAddress ? (data.residentialAddress as any) : undefined,
        professionalAddress: data.professionalAddress ? (data.professionalAddress as any) : undefined,
        occupation: data.occupation ? (data.occupation as any) : undefined,
        company: data.company ? (data.company as any) : undefined,
        maritalStatus: data.maritalStatus,
        isDeceased: data.isDeceased,
        dateOfDeath: data.dateOfDeath,
        placeOfDeath: data.placeOfDeath ? (data.placeOfDeath as any) : undefined,
        causeOfDeath: data.causeOfDeath,
        photoUrl: data.photoUrl,
        bio: data.bio ? (data.bio as any) : undefined,
      },
    });
  }

  async remove(id: string, userRole: Role) {
    if (userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can delete persons');
    }

    return this.prisma.person.delete({
      where: { id },
    });
  }

  async updateAvatar(personId: string, imageUrl: string, userId: string, userRole: Role) {
    const person = await this.prisma.person.findUnique({
      where: { id: personId },
    });

    if (!person) {
      throw new NotFoundException('Person not found');
    }

    // Check permissions
    if (userRole !== Role.ADMIN) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { person: true },
      });

      if (!user?.person || user.person.familyId !== person.familyId) {
        throw new ForbiddenException('You can only update avatars for persons in your own family');
      }
    }

    // Delete old avatar if exists
    if (person.photoUrl) {
      await this.imageService.deleteImage(person.photoUrl);
    }

    return this.prisma.person.update({
      where: { id: personId },
      data: {
        photoUrl: imageUrl,
      },
      include: { family: true },
    });
  }

  async removeAvatar(personId: string, userId: string, userRole: Role) {
    const person = await this.prisma.person.findUnique({
      where: { id: personId },
    });

    if (!person) {
      throw new NotFoundException('Person not found');
    }

    // Check permissions
    if (userRole !== Role.ADMIN) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { person: true },
      });

      if (!user?.person || user.person.familyId !== person.familyId) {
        throw new ForbiddenException('You can only remove avatars for persons in your own family');
      }
    }

    // Delete old avatar if exists
    if (person.photoUrl) {
      await this.imageService.deleteImage(person.photoUrl);
    }

    return this.prisma.person.update({
      where: { id: personId },
      data: {
        photoUrl: null,
      },
      include: { family: true },
    });
  }
}
