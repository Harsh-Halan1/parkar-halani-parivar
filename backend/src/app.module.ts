import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { SupabaseModule } from './supabase/supabase.module';
import { FamiliesModule } from './families/families.module';
import { MembersModule } from './members/members.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { StorageModule } from './storage/storage.module';
import { RelationshipsModule } from './relationships/relationships.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule,
    SupabaseModule,
    FamiliesModule,
    MembersModule,
    AnnouncementsModule,
    StorageModule,
    RelationshipsModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
