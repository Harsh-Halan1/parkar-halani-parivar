import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePreferencesDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { person: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updatePreferences(userId: string, data: UpdatePreferencesDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        preferredLanguage: data.preferredLanguage,
        isDarkMode: data.isDarkMode,
      },
    });
  }
}
