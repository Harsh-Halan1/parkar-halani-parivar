import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { SupabaseModule } from './supabase/supabase.module';
import { FamiliesModule } from './families/families.module';
import { MembersModule } from './members/members.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    PrismaModule,
    SupabaseModule,
    FamiliesModule,
    MembersModule,
    AnnouncementsModule,
    StorageModule,
  ],
})
export class AppModule {}
