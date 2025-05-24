import { Module } from '@nestjs/common';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [ApplicationController],
  providers: [ApplicationService, PrismaService],
  exports: [ApplicationService],
})
export class ApplicationModule {}
