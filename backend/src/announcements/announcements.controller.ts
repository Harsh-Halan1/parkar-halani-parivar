import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { AnnouncementsService, CreateAnnouncementDto, UpdateAnnouncementDto } from './announcements.service';

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcements: AnnouncementsService) {}

  @Get()
  findAll() {
    return this.announcements.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.announcements.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateAnnouncementDto) {
    return this.announcements.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAnnouncementDto) {
    return this.announcements.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.announcements.remove(id);
  }
}
