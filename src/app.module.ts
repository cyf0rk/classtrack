import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { AppConfigModule } from './config/config.module';
import { SportModule } from './modules/sport/sport.module';
import { ClassModule } from './modules/class/class.module';
import { ApplicationModule } from './modules/application/application.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    AuthModule,
    SportModule,
    ClassModule,
    ApplicationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
