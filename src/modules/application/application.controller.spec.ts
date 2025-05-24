import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import {
  UpdateApplicationDto,
  ApplicationStatus,
} from './dto/update-application.dto';
import { Role } from 'db';
import { Request } from '@nestjs/common';
import type { UserResponse } from '../user/types';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

interface RequestWithUser extends Request {
  user: UserResponse;
}

describe('ApplicationController', () => {
  let controller: ApplicationController;

  const mockDate = new Date();
  const mockUser: UserResponse = {
    id: 1,
    email: 'test@example.com',
    role: Role.USER,
    createdAt: mockDate,
    updatedAt: mockDate,
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

  const mockApplicationService = {
    apply: jest.fn(),
    findUserApplications: jest.fn(),
    updateStatus: jest.fn(),
  };

  const createMockRequest = (user: UserResponse): RequestWithUser => {
    const req = {} as Request;
    return Object.assign(req, { user }) as RequestWithUser;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationController],
      providers: [
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
      ],
    }).compile();

    controller = module.get<ApplicationController>(ApplicationController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('apply', () => {
    const createDto: CreateApplicationDto = {
      classId: mockClass.id,
    };

    it('should create an application successfully', async () => {
      mockApplicationService.apply.mockResolvedValue(mockApplication);
      const mockRequest = createMockRequest(mockUser);

      const result = await controller.apply(mockRequest, createDto);

      expect(result).toEqual(mockApplication);
      expect(mockApplicationService.apply).toHaveBeenCalledWith(
        mockUser.id,
        createDto,
      );
    });

    it('should handle NotFoundException when class does not exist', async () => {
      mockApplicationService.apply.mockRejectedValue(
        new NotFoundException('Class not found'),
      );
      const mockRequest = createMockRequest(mockUser);

      await expect(controller.apply(mockRequest, createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle BadRequestException when class is full', async () => {
      mockApplicationService.apply.mockRejectedValue(
        new BadRequestException('Class is full'),
      );
      const mockRequest = createMockRequest(mockUser);

      await expect(controller.apply(mockRequest, createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle ConflictException when user has already applied', async () => {
      mockApplicationService.apply.mockRejectedValue(
        new ConflictException('Already applied'),
      );
      const mockRequest = createMockRequest(mockUser);

      await expect(controller.apply(mockRequest, createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findMyApplications', () => {
    it('should return user applications successfully', async () => {
      const mockApplications = [mockApplication];
      mockApplicationService.findUserApplications.mockResolvedValue(
        mockApplications,
      );
      const mockRequest = createMockRequest(mockUser);

      const result = await controller.findMyApplications(mockRequest);

      expect(result).toEqual(mockApplications);
      expect(mockApplicationService.findUserApplications).toHaveBeenCalledWith(
        mockUser.id,
      );
    });

    it('should return empty array when user has no applications', async () => {
      mockApplicationService.findUserApplications.mockResolvedValue([]);
      const mockRequest = createMockRequest(mockUser);

      const result = await controller.findMyApplications(mockRequest);

      expect(result).toEqual([]);
      expect(mockApplicationService.findUserApplications).toHaveBeenCalledWith(
        mockUser.id,
      );
    });
  });

  describe('updateStatus', () => {
    const updateDto: UpdateApplicationDto = {
      status: ApplicationStatus.APPROVED,
    };

    it('should update application status successfully', async () => {
      const updatedApplication = {
        ...mockApplication,
        status: ApplicationStatus.APPROVED,
      };
      mockApplicationService.updateStatus.mockResolvedValue(updatedApplication);

      const result = await controller.updateStatus(
        mockApplication.id,
        updateDto,
      );

      expect(result).toEqual(updatedApplication);
      expect(mockApplicationService.updateStatus).toHaveBeenCalledWith(
        mockApplication.id,
        updateDto,
      );
    });

    it('should handle NotFoundException when application does not exist', async () => {
      mockApplicationService.updateStatus.mockRejectedValue(
        new NotFoundException('Application not found'),
      );

      await expect(controller.updateStatus(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle BadRequestException when approving to a full class', async () => {
      mockApplicationService.updateStatus.mockRejectedValue(
        new BadRequestException('Class is full'),
      );

      await expect(
        controller.updateStatus(mockApplication.id, updateDto),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
