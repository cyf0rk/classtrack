import { Test, TestingModule } from '@nestjs/testing';
import { SportController } from './sport.controller';
import { SportService } from './sport.service';
import { CreateSportDto, UpdateSportDto } from './dto';
import { Role } from 'db';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

describe('SportController', () => {
  let controller: SportController;
  let service: SportService;

  const mockSport = {
    id: 1,
    name: 'Basketball',
    description: 'A team sport',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSportService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: (context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = { role: Role.ADMIN };
      return true;
    },
  };

  const mockRolesGuard = {
    canActivate: (context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      const requiredRoles = new Reflector().get('roles', context.getHandler());
      return requiredRoles.includes(request.user.role);
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SportController],
      providers: [
        {
          provide: SportService,
          useValue: mockSportService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<SportController>(SportController);
    service = module.get<SportService>(SportService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateSportDto = {
      name: 'Basketball',
      description: 'A team sport',
    };

    it('should create a new sport', async () => {
      mockSportService.create.mockResolvedValue(mockSport);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockSport);
    });

    it('should require admin role', async () => {
      // Override the mock guard to simulate non-admin user
      const nonAdminGuard = {
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          request.user = { role: Role.USER };
          return false;
        },
      };

      const module: TestingModule = await Test.createTestingModule({
        controllers: [SportController],
        providers: [
          {
            provide: SportService,
            useValue: mockSportService,
          },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue(mockJwtAuthGuard)
        .overrideGuard(RolesGuard)
        .useValue(nonAdminGuard)
        .compile();

      const controller = module.get<SportController>(SportController);

      await expect(controller.create(createDto)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return an array of sports', async () => {
      const mockSports = [mockSport];
      mockSportService.findAll.mockResolvedValue(mockSports);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockSports);
    });

    it('should return an empty array when no sports exist', async () => {
      mockSportService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a sport by id', async () => {
      mockSportService.findOne.mockResolvedValue(mockSport);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockSport);
    });

    it('should handle non-existent sport', async () => {
      mockSportService.findOne.mockRejectedValue(new Error('Not found'));

      await expect(controller.findOne(999)).rejects.toThrow();
      expect(service.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('update', () => {
    const updateDto: UpdateSportDto = {
      name: 'Updated Basketball',
    };

    it('should update a sport', async () => {
      const updatedSport = { ...mockSport, ...updateDto };
      mockSportService.update.mockResolvedValue(updatedSport);

      const result = await controller.update(1, updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(updatedSport);
    });

    it('should require admin role', async () => {
      // Override the mock guard to simulate non-admin user
      const nonAdminGuard = {
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          request.user = { role: Role.USER };
          return false;
        },
      };

      const module: TestingModule = await Test.createTestingModule({
        controllers: [SportController],
        providers: [
          {
            provide: SportService,
            useValue: mockSportService,
          },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue(mockJwtAuthGuard)
        .overrideGuard(RolesGuard)
        .useValue(nonAdminGuard)
        .compile();

      const controller = module.get<SportController>(SportController);

      await expect(controller.update(1, updateDto)).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should delete a sport', async () => {
      mockSportService.remove.mockResolvedValue(mockSport);

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockSport);
    });

    it('should require admin role', async () => {
      // Override the mock guard to simulate non-admin user
      const nonAdminGuard = {
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          request.user = { role: Role.USER };
          return false;
        },
      };

      const module: TestingModule = await Test.createTestingModule({
        controllers: [SportController],
        providers: [
          {
            provide: SportService,
            useValue: mockSportService,
          },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue(mockJwtAuthGuard)
        .overrideGuard(RolesGuard)
        .useValue(nonAdminGuard)
        .compile();

      const controller = module.get<SportController>(SportController);

      await expect(controller.remove(1)).rejects.toThrow();
    });
  });
});
