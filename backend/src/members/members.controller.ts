import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import { CreateMemberDto, MembersService, UpdateMemberDto } from './members.service';

@Controller('members')
export class MembersController {
  constructor(private readonly members: MembersService) {}

  @Get()
  findAll() {
    return this.members.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const member = await this.members.findOne(id);
    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }
    return member;
  }

  @Post()
  create(@Body() dto: CreateMemberDto) {
    return this.members.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMemberDto) {
    return this.members.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.members.remove(id);
  }
}
