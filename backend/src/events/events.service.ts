import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ImageService } from '../shared/image.service';
import { EventType } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private imageService: ImageService,
  ) {}

  async create(data: any, userId: string) {
    return this.prisma.event.create({
      data: {
        title: data.title, // JSONB: { gu, en, hi }
        description: data.description,
        type: data.type,
        eventDate: data.eventDate,
        location: data.location,
        personId: data.personId,
        createdById: userId,
        isPublic: data.isPublic !== undefined ? data.isPublic : true,
        imageUrls: data.imageUrls || [],
      },
      include: {
        person: true,
        createdBy: {
          select: {
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async findAll(filters?: { type?: EventType; upcoming?: boolean }) {
    const where: any = { isPublic: true };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.upcoming) {
      where.eventDate = { gte: new Date() };
    }

    return this.prisma.event.findMany({
      where,
      include: {
        person: true,
        createdBy: {
          select: { email: true, phone: true },
        },
      },
      orderBy: { eventDate: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.event.findUnique({
      where: { id },
      include: {
        person: true,
        createdBy: {
          select: { email: true, phone: true },
        },
      },
    });
  }

  async update(id: string, data: any, userId: string) {
    // Verify ownership or admin role would be checked in controller
    return this.prisma.event.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        eventDate: data.eventDate,
        location: data.location,
        personId: data.personId,
        isPublic: data.isPublic,
        imageUrls: data.imageUrls,
      },
    });
  }

  async remove(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Delete all associated images
    if (event.imageUrls && Array.isArray(event.imageUrls)) {
      for (const imageUrl of event.imageUrls) {
        await this.imageService.deleteImage(imageUrl);
      }
    }

    return this.prisma.event.delete({
      where: { id },
    });
  }

  async addImage(eventId: string, imageUrl: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const imageUrls = Array.isArray(event.imageUrls) ? event.imageUrls : [];
    imageUrls.push(imageUrl);

    return this.prisma.event.update({
      where: { id: eventId },
      data: {
        imageUrls,
      },
      include: {
        person: true,
        createdBy: {
          select: { email: true, phone: true },
        },
      },
    });
  }

  async removeImage(eventId: string, imageUrl: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Delete the image file
    await this.imageService.deleteImage(imageUrl);

    // Remove from array
    const imageUrls = (event.imageUrls || []).filter((url: string) => url !== imageUrl);

    return this.prisma.event.update({
      where: { id: eventId },
      data: {
        imageUrls,
      },
      include: {
        person: true,
        createdBy: {
          select: { email: true, phone: true },
        },
      },
    });
  }
}
