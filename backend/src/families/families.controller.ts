import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CreateFamilyDto, FamiliesService, UpdateFamilyDto } from './families.service';

@Controller('families')
export class FamiliesController {
  constructor(private readonly families: FamiliesService) {}

  @Get()
  findAll() {
    return this.families.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.families.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateFamilyDto) {
    return this.families.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFamilyDto) {
    return this.families.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.families.remove(id);
  }
}
