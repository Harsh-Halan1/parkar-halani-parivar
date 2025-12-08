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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ImageService } from '../shared/image.service';
import { EventType } from '@prisma/client';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(
    private eventsService: EventsService,
    private imageService: ImageService,
  ) {}

  @Post()
  create(@Body() data: any, @Req() req: any) {
    return this.eventsService.create(data, req.user.sub);
  }

  @Get()
  findAll(
    @Query('type') type?: EventType,
    @Query('upcoming') upcoming?: string,
  ) {
    return this.eventsService.findAll({ 
      type, 
      upcoming: upcoming === 'true' 
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    return this.eventsService.update(id, data, req.user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Post(':id/images')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Param('id') eventId: string,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new Error('No file provided');
    }

    const imageUrl = await this.imageService.saveImageLocally(file, 'events');
    return this.eventsService.addImage(eventId, imageUrl);
  }

  @Delete(':id/images/:imageUrl')
  async removeImage(
    @Param('id') eventId: string,
    @Param('imageUrl') imageUrl: string,
  ) {
    return this.eventsService.removeImage(eventId, decodeURIComponent(imageUrl));
  }
}
