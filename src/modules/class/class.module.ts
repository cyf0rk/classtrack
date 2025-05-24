import { Module } from '@nestjs/common';
import { ClassService } from './class.service';
import { ClassController } from './class.controller';
import { PrismaService } from '../../database/prisma.service';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [ApplicationModule],
  controllers: [ClassController],
  providers: [ClassService, PrismaService],
  exports: [ClassService],
})
export class ClassModule {}
