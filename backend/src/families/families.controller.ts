import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FamiliesService } from './families.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateFamilyDto, UpdateFamilyDto } from './dto';

@Controller('families')
@UseGuards(JwtAuthGuard)
export class FamiliesController {
  constructor(private familiesService: FamiliesService) {}

  @Post()
  create(@Body() data: CreateFamilyDto, @Req() req: any) {
    return this.familiesService.create(data, req.user.sub, req.user.role);
  }

  @Get()
  findAll() {
    return this.familiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.familiesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateFamilyDto, @Req() req: any) {
    return this.familiesService.update(id, data, req.user.sub, req.user.role);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.familiesService.remove(id, req.user.role);
  }
}
