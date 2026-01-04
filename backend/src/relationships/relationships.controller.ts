import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CreateRelationshipDto, RelationshipsService, UpdateRelationshipDto } from './relationships.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('relationships')
@UseGuards(JwtAuthGuard)
export class RelationshipsController {
  constructor(private readonly relationships: RelationshipsService) {}

  @Get()
  findAll() {
    return this.relationships.findAll();
  }

  @Get('member/:memberId')
  findByMember(@Param('memberId') memberId: string) {
    return this.relationships.findByMember(memberId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const relationship = await this.relationships.findOne(id);
    if (!relationship) {
      throw new NotFoundException(`Relationship with ID ${id} not found`);
    }
    return relationship;
  }

  @Post()
  create(@Body() dto: CreateRelationshipDto) {
    return this.relationships.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRelationshipDto) {
    return this.relationships.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.relationships.remove(id);
  }
}
