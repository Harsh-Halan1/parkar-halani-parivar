import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import { CreateFamilyDto, FamiliesService, UpdateFamilyDto } from './families.service';

@Controller('families')
export class FamiliesController {
  constructor(private readonly families: FamiliesService) {}

  @Get()
  findAll() {
    return this.families.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const family = await this.families.findOne(id);
    if (!family) {
      throw new NotFoundException(`Family with ID ${id} not found`);
    }
    return family;
  }

  @Post()
  create(@Body() dto: CreateFamilyDto) {
    return this.families.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFamilyDto) {
    return this.families.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.families.remove(id);
  }
}
