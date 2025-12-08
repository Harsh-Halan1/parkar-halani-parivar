import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventType } from '@prisma/client';

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, userId: string) {
    return this.prisma.announcement.create({
      data: {
        title: data.title, // JSONB: { gu, en, hi }
        content: data.content,
        type: data.type,
        personId: data.personId,
        createdById: userId,
        isPublic: data.isPublic !== undefined ? data.isPublic : true,
        isPinned: data.isPinned || false,
        imageUrls: data.imageUrls || [],
      },
      include: {
        person: true,
        createdBy: {
          select: { email: true, phone: true },
        },
      },
    });
  }

  async findAll(filters?: { type?: EventType; pinned?: boolean }) {
    const where: any = { isPublic: true };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.pinned !== undefined) {
      where.isPinned = filters.pinned;
    }

    return this.prisma.announcement.findMany({
      where,
      include: {
        person: true,
        createdBy: {
          select: { email: true, phone: true },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: string) {
    return this.prisma.announcement.findUnique({
      where: { id },
      include: {
        person: true,
        createdBy: {
          select: { email: true, phone: true },
        },
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.announcement.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        type: data.type,
        personId: data.personId,
        isPublic: data.isPublic,
        isPinned: data.isPinned,
        imageUrls: data.imageUrls,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.announcement.delete({
      where: { id },
    });
  }
}
