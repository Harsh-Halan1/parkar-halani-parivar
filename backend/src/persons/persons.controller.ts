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
import { PersonsService } from './persons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePersonDto, UpdatePersonDto, PersonFilterDto } from './dto';
import { ImageService } from '../shared/image.service';

@Controller('persons')
@UseGuards(JwtAuthGuard)
export class PersonsController {
  constructor(
    private personsService: PersonsService,
    private imageService: ImageService,
  ) {}

  @Post()
  create(@Body() data: CreatePersonDto, @Req() req: any) {
    return this.personsService.create(data, req.user.sub, req.user.role);
  }

  @Get()
  findAll(@Query() filters: PersonFilterDto) {
    return this.personsService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdatePersonDto, @Req() req: any) {
    return this.personsService.update(id, data, req.user.sub, req.user.role);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.personsService.remove(id, req.user.role);
  }

  @Post(':id/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @Param('id') personId: string,
    @UploadedFile() file: any,
    @Req() req: any,
  ) {
    if (!file) {
      throw new Error('No file provided');
    }

    const imageUrl = await this.imageService.saveImageLocally(file, 'avatars');
    return this.personsService.updateAvatar(personId, imageUrl, req.user.sub, req.user.role);
  }

  @Delete(':id/avatar')
  async removeAvatar(@Param('id') personId: string, @Req() req: any) {
    return this.personsService.removeAvatar(personId, req.user.sub, req.user.role);
  }
}
