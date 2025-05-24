import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationService } from './application.service';
import { PrismaService } from '../../database/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import {
  UpdateApplicationDto,
  ApplicationStatus,
} from './dto/update-application.dto';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Role } from 'db';
import { Prisma } from 'db';

describe('ApplicationService', () => {
  let service: ApplicationService;

  const mockPrismaService = {
    application: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    class: {
      findUnique: jest.fn(),
    },
  };

  const mockDate = new Date();
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    role: Role.USER,
  };

  const mockClass = {
    id: 1,
    title: 'Test Class',
    capacity: 2,
    sportId: 1,
    sport: {
      id: 1,
      name: 'Test Sport',
    },
  };

  const mockApplication = {
    id: 1,
    userId: mockUser.id,
    classId: mockClass.id,
    status: ApplicationStatus.PENDING,
    createdAt: mockDate,
    updatedAt: mockDate,
    user: mockUser,
    class: mockClass,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ApplicationService>(ApplicationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('apply', () => {
    const createDto: CreateApplicationDto = {
      classId: mockClass.id,
    };

    it('should create an application successfully', async () => {
      mockPrismaService.class.findUnique.mockResolvedValue({
        ...mockClass,
        _count: { applications: 1 },
      });
      mockPrismaService.application.create.mockResolvedValue(mockApplication);

      const result = await service.apply(mockUser.id, createDto);

      expect(result).toEqual(mockApplication);
      expect(mockPrismaService.class.findUnique).toHaveBeenCalledWith({
        where: { id: createDto.classId },
        include: {
          _count: {
            select: { applications: true },
          },
        },
      });
      expect(mockPrismaService.application.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          classId: createDto.classId,
        },
        include: {
          class: {
            include: {
              sport: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when class does not exist', async () => {
      mockPrismaService.class.findUnique.mockResolvedValue(null);

      await expect(service.apply(mockUser.id, createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when class is full', async () => {
      mockPrismaService.class.findUnique.mockResolvedValue({
        ...mockClass,
        _count: { applications: mockClass.capacity },
      });

      await expect(service.apply(mockUser.id, createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException when user has already applied', async () => {
      mockPrismaService.class.findUnique.mockResolvedValue({
        ...mockClass,
        _count: { applications: 1 },
      });

      // Create a mock Prisma error for unique constraint violation
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
          meta: {
            target: ['userId', 'classId'],
          },
        },
      );
      mockPrismaService.application.create.mockRejectedValue(prismaError);

      await expect(service.apply(mockUser.id, createDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.apply(mockUser.id, createDto)).rejects.toMatchObject(
        {
          message: 'You have already applied for this class',
        },
      );
    });
  });

  describe('findUserApplications', () => {
    it('should return user applications', async () => {
      const mockApplications = [mockApplication];
      mockPrismaService.application.findMany.mockResolvedValue(
        mockApplications,
      );

      const result = await service.findUserApplications(mockUser.id);

      expect(result).toEqual(mockApplications);
      expect(mockPrismaService.application.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
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
    });
  });

  describe('updateStatus', () => {
    const updateDto: UpdateApplicationDto = {
      status: ApplicationStatus.APPROVED,
    };

    it('should update application status successfully', async () => {
      mockPrismaService.application.findUnique.mockResolvedValue({
        ...mockApplication,
        class: {
          ...mockClass,
          _count: {
            applications: {
              where: { status: ApplicationStatus.APPROVED },
            },
          },
        },
      });
      mockPrismaService.application.update.mockResolvedValue({
        ...mockApplication,
        status: ApplicationStatus.APPROVED,
      });

      const result = await service.updateStatus(mockApplication.id, updateDto);

      expect(result.status).toBe(ApplicationStatus.APPROVED);
      expect(mockPrismaService.application.update).toHaveBeenCalledWith({
        where: { id: mockApplication.id },
        data: { status: updateDto.status },
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
    });

    it('should throw NotFoundException when application does not exist', async () => {
      mockPrismaService.application.findUnique.mockResolvedValue(null);

      await expect(service.updateStatus(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when approving to a full class', async () => {
      mockPrismaService.application.findUnique.mockResolvedValue({
        ...mockApplication,
        class: {
          ...mockClass,
          _count: {
            applications: {
              where: { status: ApplicationStatus.APPROVED },
            },
          },
        },
      });

      // Set class to full capacity
      mockPrismaService.application.findUnique.mockResolvedValue({
        ...mockApplication,
        class: {
          ...mockClass,
          _count: {
            applications: mockClass.capacity,
          },
        },
      });

      await expect(
        service.updateStatus(mockApplication.id, updateDto),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
