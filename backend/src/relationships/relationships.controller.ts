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
import { RelationshipsService } from './relationships.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRelationshipDto, UpdateRelationshipDto } from './dto';

@Controller('relationships')
@UseGuards(JwtAuthGuard)
export class RelationshipsController {
  constructor(private relationshipsService: RelationshipsService) {}

  @Get()
  findAll() {
    return this.relationshipsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.relationshipsService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateRelationshipDto, @Req() req: any) {
    return this.relationshipsService.create(data, req.user.sub, req.user.role);
  }

  @Get('person/:personId')
  findByPerson(@Param('personId') personId: string) {
    return this.relationshipsService.findByPerson(personId);
  }

  @Get('family-tree/:familyId')
  findFamilyTree(@Param('familyId') familyId: string) {
    return this.relationshipsService.findFamilyTree(familyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateRelationshipDto, @Req() req: any) {
    return this.relationshipsService.update(id, data, req.user.sub, req.user.role);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.relationshipsService.remove(id, req.user.role);
  }
}
