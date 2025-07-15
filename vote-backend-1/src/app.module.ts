import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';

// Core modules
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { NominationModule } from './modules/nominations/nomination.module';
import { AdminModule } from './modules/admin/admin.module';
import { FileUploadModule } from './modules/file-upload/file-upload.module';
import { DbModule, PrismaService } from '../db';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import {CustomThrottlerGuard} from "./throttler.guard";


// NOTE: 'prisma/.env', // Load Prisma-specific env file

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [
                process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev',
                'prisma/.env', // Load Prisma env for DATABASE_URL
            ],
            cache: true,
        }),

        // Rate limiting
        ThrottlerModule.forRoot([
            {
                name: 'default',
                ttl: 60000, // 1 minute
                limit: 100,
            },
        ]),

        // Scheduled tasks (for deadline checks)
        ScheduleModule.forRoot(),

        // Feature modules
        AuthModule,
        UsersModule,
        NotificationsModule,
        NominationModule,
        AdminModule,
        FileUploadModule,
        DbModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
    ],
})
export class AppModule {
    constructor() {
        console.log('Instantiating AppModule');
    }
}