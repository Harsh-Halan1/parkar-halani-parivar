import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import { AnnouncementsService, CreateAnnouncementDto, UpdateAnnouncementDto } from './announcements.service';

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcements: AnnouncementsService) {}

  @Get()
  findAll() {
    return this.announcements.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const announcement = await this.announcements.findOne(id);
    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }
    return announcement;
  }

  @Post()
  create(@Body() dto: CreateAnnouncementDto) {
    return this.announcements.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAnnouncementDto) {
    return this.announcements.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.announcements.remove(id);
  }
}
