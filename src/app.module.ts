import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { AppConfigModule } from './config/config.module';
import { SportModule } from './modules/sport/sport.module';

@Module({
  imports: [AppConfigModule, DatabaseModule, AuthModule, SportModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
