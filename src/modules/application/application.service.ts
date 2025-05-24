import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import {
  UpdateApplicationDto,
  ApplicationStatus,
} from './dto/update-application.dto';
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

  async findUserApplications(userId: number) {
    return this.prisma.application.findMany({
      where: { userId },
      include: {
        class: {
          include: {
            sport: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateStatus(applicationId: number, dto: UpdateApplicationDto) {
    // Check if application exists and get approved applications count
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        class: {
          include: {
            _count: {
              select: {
                applications: {
                  where: {
                    status: ApplicationStatus.APPROVED,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (
      dto.status === ApplicationStatus.APPROVED &&
      (application.status as ApplicationStatus) !== ApplicationStatus.APPROVED
    ) {
      // Check if class is full
      if (application.class._count.applications >= application.class.capacity) {
        throw new BadRequestException(
          'Cannot approve application: class is at full capacity',
        );
      }
    }

    return this.prisma.application.update({
      where: { id: applicationId },
      data: { status: dto.status },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        class: {
          include: {
            sport: true,
          },
        },
      },
    });
  }

  async findClassApplications(classId: number) {
    const classData = await this.prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classData) {
      throw new NotFoundException('Class not found');
    }

    return this.prisma.application.findMany({
      where: { classId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
