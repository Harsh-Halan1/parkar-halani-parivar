import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EventType } from '@prisma/client';

@Controller('announcements')
@UseGuards(JwtAuthGuard)
export class AnnouncementsController {
  constructor(private announcementsService: AnnouncementsService) {}

  @Post()
  create(@Body() data: any, @Req() req: any) {
    return this.announcementsService.create(data, req.user.sub);
  }

  @Get()
  findAll(
    @Query('type') type?: EventType,
    @Query('pinned') pinned?: string,
  ) {
    return this.announcementsService.findAll({
      type,
      pinned: pinned === 'true' ? true : pinned === 'false' ? false : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.announcementsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.announcementsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.announcementsService.remove(id);
  }
}
