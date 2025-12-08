import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FamiliesModule } from './families/families.module';
import { PersonsModule } from './persons/persons.module';
import { RelationshipsModule } from './relationships/relationships.module';
import { EventsModule } from './events/events.module';
import { AnnouncementsModule } from './announcements/announcements.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 seconds
      limit: 10, // 10 requests
    }]),
    
    // Database
    PrismaModule,
    
    // Feature modules
    AuthModule,
    UsersModule,
    FamiliesModule,
    PersonsModule,
    RelationshipsModule,
    EventsModule,
    AnnouncementsModule,
  ],
})
export class AppModule {}
