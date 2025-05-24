import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { Prisma } from 'db';

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaService) {}

  async apply(userId: number, dto: CreateApplicationDto) {
    // Check if class exists and get its capacity
    const classData = await this.prisma.class.findUnique({
      where: { id: dto.classId },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!classData) {
      throw new NotFoundException('Class not found');
    }

    // Check if class is full
    if (classData._count.applications >= classData.capacity) {
      throw new BadRequestException('Class is at full capacity');
    }

    try {
      // Create application (unique constraint will prevent duplicates)
      return await this.prisma.application.create({
        data: {
          userId,
          classId: dto.classId,
        },
        include: {
          class: {
            include: {
              sport: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'You have already applied for this class',
          );
        }
      }
      throw error;
    }
  }
}
