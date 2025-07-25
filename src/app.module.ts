import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UploadModule } from './upload/upload.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    BookmarkModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UploadModule,
    HealthModule,
  ],
})
export class AppModule {}
