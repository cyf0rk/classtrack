import { Test, TestingModule } from '@nestjs/testing';
import { SportController } from './sport.controller';
import { SportService } from './sport.service';
import { CreateSportDto, UpdateSportDto } from './dto';
import { Role } from 'db';
import { ExecutionContext, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('SportController', () => {
  let app: INestApplication;
  let service: SportService;

  const mockSport = {
    id: 1,
    name: 'Basketball',
    description: 'A team sport',
  };

  const mockSportService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  // Mock request object that we can modify for different tests
  const mockRequest: { user: { role: Role } | null } = {
    user: { role: Role.ADMIN },
  };

  const mockJwtAuthGuard = {
    canActivate: (context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      if (!mockRequest.user) {
        throw new UnauthorizedException('No user found');
      }
      Object.assign(request, mockRequest);
      return true;
    },
  };

  const mockRolesGuard = {
    canActivate: (context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      if (!request.user) {
        throw new UnauthorizedException('No user found');
      }
      const requiredRoles = new Reflector().get('roles', context.getHandler());
      if (!requiredRoles) return true;
      if (!requiredRoles.includes(request.user.role)) {
        throw new ForbiddenException('Insufficient permissions');
      }
      return true;
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

    app = module.createNestApplication();
    await app.init();
    service = module.get<SportService>(SportService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    // Reset mock request to admin role after each test
    mockRequest.user = { role: Role.ADMIN };
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateSportDto = {
      name: 'Basketball',
      description: 'A team sport',
    };

    it('should create a new sport when user is admin', async () => {
      mockSportService.create.mockResolvedValue(mockSport);

      const response = await request(app.getHttpServer())
        .post('/sports')
        .send(createDto)
        .expect(201);

      expect(response.body).toEqual(mockSport);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should return 403 when user is not admin', async () => {
      mockRequest.user = { role: Role.USER };
      mockSportService.create.mockResolvedValue(mockSport);

      await request(app.getHttpServer())
        .post('/sports')
        .send(createDto)
        .expect(403);

      expect(service.create).not.toHaveBeenCalled();
    });

    it('should return 401 when no user is present', async () => {
      mockRequest.user = null;
      mockSportService.create.mockResolvedValue(mockSport);

      await request(app.getHttpServer())
        .post('/sports')
        .send(createDto)
        .expect(401);

      expect(service.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of sports', async () => {
      const mockSports = [mockSport];
      mockSportService.findAll.mockResolvedValue(mockSports);

      const response = await request(app.getHttpServer())
        .get('/sports')
        .expect(200);

      expect(response.body).toEqual(mockSports);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return an empty array when no sports exist', async () => {
      mockSportService.findAll.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/sports')
        .expect(200);

      expect(response.body).toEqual([]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a sport by id', async () => {
      mockSportService.findOne.mockResolvedValue(mockSport);

      const response = await request(app.getHttpServer())
        .get('/sports/1')
        .expect(200);

      expect(response.body).toEqual(mockSport);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should return 404 for non-existent sport', async () => {
      mockSportService.findOne.mockRejectedValue(new NotFoundException('Sport not found'));

      await request(app.getHttpServer())
        .get('/sports/999')
        .expect(404);

      expect(service.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('update', () => {
    const updateDto: UpdateSportDto = {
      name: 'Updated Basketball',
    };

    it('should update a sport when user is admin', async () => {
      const updatedSport = { ...mockSport, ...updateDto };
      mockSportService.update.mockResolvedValue(updatedSport);

      const response = await request(app.getHttpServer())
        .patch('/sports/1')
        .send(updateDto)
        .expect(200);

      expect(response.body).toEqual(updatedSport);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should return 403 when user is not admin', async () => {
      mockRequest.user = { role: Role.USER };
      mockSportService.update.mockResolvedValue(mockSport);

      await request(app.getHttpServer())
        .patch('/sports/1')
        .send(updateDto)
        .expect(403);

      expect(service.update).not.toHaveBeenCalled();
    });

    it('should return 401 when no user is present', async () => {
      mockRequest.user = null;
      mockSportService.update.mockResolvedValue(mockSport);

      await request(app.getHttpServer())
        .patch('/sports/1')
        .send(updateDto)
        .expect(401);

      expect(service.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a sport when user is admin', async () => {
      mockSportService.remove.mockResolvedValue(mockSport);

      const response = await request(app.getHttpServer())
        .delete('/sports/1')
        .expect(200);

      expect(response.body).toEqual(mockSport);
      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should return 403 when user is not admin', async () => {
      mockRequest.user = { role: Role.USER };
      mockSportService.remove.mockResolvedValue(mockSport);

      await request(app.getHttpServer())
        .delete('/sports/1')
        .expect(403);

      expect(service.remove).not.toHaveBeenCalled();
    });

    it('should return 401 when no user is present', async () => {
      mockRequest.user = null;
      mockSportService.remove.mockResolvedValue(mockSport);

      await request(app.getHttpServer())
        .delete('/sports/1')
        .expect(401);

      expect(service.remove).not.toHaveBeenCalled();
    });
  });
});
