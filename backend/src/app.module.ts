import { Module } from '@nestjs/common';
import { FamiliesModule } from './families/families.module';
import { MembersModule } from './members/members.module';
import { AnnouncementsModule } from './announcements/announcements.module';

@Module({
  imports: [FamiliesModule, MembersModule, AnnouncementsModule],
})
export class AppModule {}
