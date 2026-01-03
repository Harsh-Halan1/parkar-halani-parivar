import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Announcement } from '@prisma/client';

export type AnnouncementType = 'Birth' | 'Death' | 'Wedding' | 'Birthday' | 'General';

export interface CreateAnnouncementDto {
  title: string;
  content: string;
  type: AnnouncementType;
  familyId: string;
}

export interface UpdateAnnouncementDto extends Partial<CreateAnnouncementDto> {}

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Announcement[]> {
    return this.prisma.announcement.findMany({
      include: {
        family: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Announcement | null> {
    return this.prisma.announcement.findUnique({
      where: { id },
      include: {
        family: true,
      },
    });
  }

  async findByFamily(familyId: string): Promise<Announcement[]> {
    return this.prisma.announcement.findMany({
      where: { familyId },
      include: {
        family: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(dto: CreateAnnouncementDto): Promise<Announcement> {
    return this.prisma.announcement.create({
      data: {
        title: dto.title.trim(),
        content: dto.content.trim(),
        type: dto.type,
        familyId: dto.familyId,
      },
      include: {
        family: true,
      },
    });
  }

  async update(id: string, dto: UpdateAnnouncementDto): Promise<Announcement> {
    return this.prisma.announcement.update({
      where: { id },
      data: {
        title: dto.title?.trim(),
        content: dto.content?.trim(),
        type: dto.type,
      },
      include: {
        family: true,
      },
    });
  }

  async remove(id: string): Promise<Announcement> {
    return this.prisma.announcement.delete({
      where: { id },
    });
  }
}
