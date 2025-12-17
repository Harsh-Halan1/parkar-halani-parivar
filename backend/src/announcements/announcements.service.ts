import { Injectable } from '@nestjs/common';

export type AnnouncementType = 'birthday' | 'anniversary' | 'wedding' | 'celebration' | 'death' | 'other';

export interface Announcement {
  id: number;
  name: string;
  date: string;
  type: AnnouncementType;
  attendees?: number;
  description?: string;
}

export interface CreateAnnouncementDto {
  name: string;
  date: string;
  type: AnnouncementType;
  attendees?: number;
  description?: string;
}

export interface UpdateAnnouncementDto extends Partial<CreateAnnouncementDto> {}

@Injectable()
export class AnnouncementsService {
  private announcements: Announcement[] = [
    { id: 1, name: 'Rohan Birthday', date: '2025-12-25', type: 'birthday', attendees: 25, description: 'Celebrate with family and friends' },
    { id: 2, name: 'Meera Anniversary', date: '2026-01-12', type: 'anniversary', attendees: 50, description: '25th anniversary celebration' },
    { id: 3, name: 'Kishan Wedding', date: '2026-02-10', type: 'wedding', description: 'Destination wedding' }
  ];

  findAll(): Announcement[] {
    return this.announcements;
  }

  findOne(id: number): Announcement | undefined {
    return this.announcements.find((a) => a.id === id);
  }

  create(dto: CreateAnnouncementDto): Announcement {
    const announcement: Announcement = {
      id: Date.now(),
      name: dto.name.trim(),
      date: dto.date,
      type: dto.type,
      attendees: dto.attendees,
      description: dto.description,
    };
    this.announcements.push(announcement);
    return announcement;
  }

  update(id: number, dto: UpdateAnnouncementDto): Announcement | undefined {
    const announcement = this.findOne(id);
    if (!announcement) return undefined;
    if (dto.name !== undefined) announcement.name = dto.name.trim();
    if (dto.date !== undefined) announcement.date = dto.date;
    if (dto.type !== undefined) announcement.type = dto.type;
    if (dto.attendees !== undefined) announcement.attendees = dto.attendees;
    if (dto.description !== undefined) announcement.description = dto.description;
    return announcement;
  }

  remove(id: number): boolean {
    const before = this.announcements.length;
    this.announcements = this.announcements.filter((a) => a.id !== id);
    return this.announcements.length < before;
  }
}
