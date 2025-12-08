import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdatePreferencesDto } from './dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getProfile(@Req() req: any) {
    return this.usersService.findOne(req.user.sub);
  }

  @Patch('preferences')
  async updatePreferences(@Req() req: any, @Body() data: UpdatePreferencesDto) {
    return this.usersService.updatePreferences(req.user.sub, data);
  }
}
