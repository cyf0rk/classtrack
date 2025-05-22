import { Module } from '@nestjs/common';
import { SportService } from './sport.service';
import { SportController } from './sport.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [SportController],
  providers: [SportService, PrismaService],
  exports: [SportService],
})
export class SportModule {}
