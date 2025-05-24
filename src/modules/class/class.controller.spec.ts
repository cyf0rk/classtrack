import { Test, TestingModule } from '@nestjs/testing';
import { ClassController } from './class.controller';
import { ClassService } from './class.service';
import { ApplicationService } from '../application/application.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import {
  ValidationPipe,
  INestApplication,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ExecutionContext,
} from '@nestjs/common';
import { ScheduleDto } from './dto/schedule.dto';
import { SessionDto } from './dto/session.dto';
import * as supertest from 'supertest';
import { Express } from 'express';
import { Role } from 'db';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { UserResponse } from '../user/types';

describe('ClassController', () => {
  let app: INestApplication;
  let httpServer: Express;
  let request: ReturnType<typeof supertest>;

  const mockClassService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockApplicationService = {
    findClassApplications: jest.fn(),
  };

  const mockDate = new Date();
  const mockUser: Partial<UserResponse> = {
    id: 1,
    email: 'test@example.com',
    role: Role.USER,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockAdmin: Partial<UserResponse> = {
    id: 2,
    email: 'admin@example.com',
    role: Role.ADMIN,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  interface MockApplication {
    id: number;
    userId: number;
    classId: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    user: Partial<UserResponse>;
  }

  const mockApplication: Partial<MockApplication> = {
    id: 1,
    userId: mockUser.id,
    classId: 1,
    status: 'pending',
    createdAt: mockDate,
    updatedAt: mockDate,
    user: mockUser,
  };

  const validSchedule: ScheduleDto = {
    Monday: [
      { startTime: '10:00', duration: 60 },
      { startTime: '16:00', duration: 90 },
    ],
    Wednesday: [{ startTime: '17:30', duration: 60 }],
  };

  const validCreateDto: CreateClassDto = {
    sportId: 1,
    title: 'Advanced Basketball',
    description: 'Master professional techniques',
    schedule: validSchedule,
    capacity: 20,
  };

  const validUpdateDto: UpdateClassDto = {
    title: 'Updated Basketball Class',
    capacity: 25,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassController],
      providers: [
        {
          provide: ClassService,
          useValue: mockClassService,
        },
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          if (request.headers['x-test-user']) {
            request.user =
              request.headers['x-test-user'] === 'admin' ? mockAdmin : mockUser;
            return true;
          }
          throw new UnauthorizedException();
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          const user = request.user;
          if (!user) {
            throw new UnauthorizedException();
          }
          if (user.role !== Role.ADMIN) {
            throw new ForbiddenException();
          }
          return true;
        },
      })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    httpServer = app.getHttpServer() as Express;
    request = supertest(httpServer);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('POST /classes', () => {
    it('should create a class with valid data', async () => {
      const expectedResult = { id: 1, ...validCreateDto };
      mockClassService.create.mockResolvedValue(expectedResult);

      const response = await request
        .post('/classes')
        .set('x-test-user', 'admin')
        .send(validCreateDto)
        .expect(201);

      expect(response.body).toMatchObject(expectedResult);
      expect(mockClassService.create).toHaveBeenCalledWith(validCreateDto);
    });

    it('should return 400 when sportId is missing', async () => {
      const { sportId: _sportId, ...invalidDto } = validCreateDto;

      await request
        .post('/classes')
        .set('x-test-user', 'admin')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 when title is empty', async () => {
      const invalidDto = { ...validCreateDto, title: '' };

      await request
        .post('/classes')
        .set('x-test-user', 'admin')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 when capacity is not a number', async () => {
      const invalidDto = { ...validCreateDto, capacity: '20' };

      await request
        .post('/classes')
        .set('x-test-user', 'admin')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 when schedule is invalid', async () => {
      const invalidSchedule: Partial<ScheduleDto> = {
        Monday: [{ startTime: 'invalid', duration: 60 } as SessionDto],
      };
      const invalidDto = {
        ...validCreateDto,
        schedule: invalidSchedule as ScheduleDto,
      };

      await request
        .post('/classes')
        .set('x-test-user', 'admin')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      await request.post('/classes').send(validCreateDto).expect(401);
    });

    it('should return 403 when not admin', async () => {
      await request
        .post('/classes')
        .set('x-test-user', 'user')
        .send(validCreateDto)
        .expect(403);
    });
  });

  describe('GET /classes', () => {
    it('should return an array of classes', async () => {
      const expectedResult = [
        { id: 1, ...validCreateDto },
        { id: 2, ...validCreateDto },
      ];
      mockClassService.findAll.mockResolvedValue(expectedResult);

      const response = await request.get('/classes').expect(200);

      expect(response.body).toMatchObject(expectedResult);
      expect(mockClassService.findAll).toHaveBeenCalledWith();
    });

    it('should filter classes by a single sport', async () => {
      const expectedResult = [{ id: 1, ...validCreateDto }];
      mockClassService.findAll.mockResolvedValue(expectedResult);

      const response = await request
        .get('/classes?sports=baseball')
        .expect(200);

      expect(response.body).toMatchObject(expectedResult);
      expect(mockClassService.findAll).toHaveBeenCalledWith({
        sports: ['baseball'],
      });
    });

    it('should filter classes by multiple sports', async () => {
      const expectedResult = [{ id: 1, ...validCreateDto }];
      mockClassService.findAll.mockResolvedValue(expectedResult);

      const response = await request
        .get('/classes?sports=basketball,football')
        .expect(200);

      expect(response.body).toMatchObject(expectedResult);
      expect(mockClassService.findAll).toHaveBeenCalledWith({
        sports: ['basketball', 'football'],
      });
    });

    it('should convert sport names to lowercase', async () => {
      const expectedResult = [{ id: 1, ...validCreateDto }];
      mockClassService.findAll.mockResolvedValue(expectedResult);

      const response = await request
        .get('/classes?sports=Basketball,Football')
        .expect(200);

      expect(response.body).toMatchObject(expectedResult);
      expect(mockClassService.findAll).toHaveBeenCalledWith({
        sports: ['basketball', 'football'],
      });
    });

    it('should ignore invalid sports format and return all classes', async () => {
      const expectedResult = [
        { id: 1, ...validCreateDto },
        { id: 2, ...validCreateDto },
      ];
      mockClassService.findAll.mockResolvedValue(expectedResult);

      const response = await request
        .get('/classes?sports=basketball;football')
        .expect(200);

      expect(response.body).toMatchObject(expectedResult);
      expect(mockClassService.findAll).toHaveBeenCalledWith();
    });

    it('should ignore non-alphabetic sports and return all classes', async () => {
      const expectedResult = [
        { id: 1, ...validCreateDto },
        { id: 2, ...validCreateDto },
      ];
      mockClassService.findAll.mockResolvedValue(expectedResult);

      const response = await request
        .get('/classes?sports=basketball123,football')
        .expect(200);

      expect(response.body).toMatchObject(expectedResult);
      expect(mockClassService.findAll).toHaveBeenCalledWith();
    });
  });

  describe('GET /classes/:id', () => {
    it('should return a class by id', async () => {
      const expectedResult = { id: 1, ...validCreateDto };
      mockClassService.findOne.mockResolvedValue(expectedResult);

      const response = await request.get('/classes/1').expect(200);

      expect(response.body).toMatchObject(expectedResult);
      expect(mockClassService.findOne).toHaveBeenCalledWith(1);
    });

    it('should return 400 when id is not a number', async () => {
      await request.get('/classes/invalid').expect(400);
    });
  });

  describe('PATCH /classes/:id', () => {
    it('should update a class with valid data', async () => {
      const expectedResult = { id: 1, ...validCreateDto, ...validUpdateDto };
      mockClassService.update.mockResolvedValue(expectedResult);

      const response = await request
        .patch('/classes/1')
        .set('x-test-user', 'admin')
        .send(validUpdateDto)
        .expect(200);

      expect(response.body).toMatchObject(expectedResult);
      expect(mockClassService.update).toHaveBeenCalledWith(1, validUpdateDto);
    });

    it('should return 400 when id is not a number', async () => {
      await request
        .patch('/classes/invalid')
        .set('x-test-user', 'admin')
        .send(validUpdateDto)
        .expect(400);
    });

    it('should return 400 when update data is invalid', async () => {
      const invalidDto = { ...validUpdateDto, capacity: 'invalid' };

      await request
        .patch('/classes/1')
        .set('x-test-user', 'admin')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      await request.patch('/classes/1').send(validUpdateDto).expect(401);
    });

    it('should return 403 when not admin', async () => {
      await request
        .patch('/classes/1')
        .set('x-test-user', 'user')
        .send(validUpdateDto)
        .expect(403);
    });
  });

  describe('DELETE /classes/:id', () => {
    it('should remove a class by id', async () => {
      const expectedResult = { id: 1, ...validCreateDto };
      mockClassService.remove.mockResolvedValue(expectedResult);

      const response = await request
        .delete('/classes/1')
        .set('x-test-user', 'admin')
        .expect(200);

      expect(response.body).toMatchObject(expectedResult);
      expect(mockClassService.remove).toHaveBeenCalledWith(1);
    });

    it('should return 400 when id is not a number', async () => {
      await request
        .delete('/classes/invalid')
        .set('x-test-user', 'admin')
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      await request.delete('/classes/1').expect(401);
    });

    it('should return 403 when not admin', async () => {
      await request.delete('/classes/1').set('x-test-user', 'user').expect(403);
    });
  });

  describe('GET /classes/:id/applications', () => {
    it('should return applications for a class when user is admin', async () => {
      const mockApplications = [
        {
          ...mockApplication,
          createdAt: new Date(mockApplication.createdAt!),
          updatedAt: new Date(mockApplication.updatedAt!),
          user: {
            ...mockApplication.user,
            createdAt: new Date(mockApplication.user!.createdAt!),
            updatedAt: new Date(mockApplication.user!.updatedAt!),
          },
        },
      ];
      mockApplicationService.findClassApplications.mockResolvedValue(
        mockApplications,
      );

      const response = await request
        .get('/classes/1/applications')
        .set('x-test-user', 'admin')
        .expect(200);

      expect(response.body).toMatchObject(
        mockApplications.map((app) => ({
          ...app,
          createdAt: app.createdAt.toISOString(),
          updatedAt: app.updatedAt.toISOString(),
          user: {
            ...app.user,
            createdAt: app.user.createdAt.toISOString(),
            updatedAt: app.user.updatedAt.toISOString(),
          },
        })),
      );
      expect(mockApplicationService.findClassApplications).toHaveBeenCalledWith(
        1,
      );
    });

    it('should return 403 when user is not admin', async () => {
      await request
        .get('/classes/1/applications')
        .set('x-test-user', 'user')
        .expect(403);
    });

    it('should return 401 when no user is authenticated', async () => {
      await request.get('/classes/1/applications').expect(401);
    });

    it('should return 400 when class id is not a number', async () => {
      await request
        .get('/classes/invalid/applications')
        .set('x-test-user', 'admin')
        .expect(400);
    });

    it('should return 404 when class does not exist', async () => {
      mockApplicationService.findClassApplications.mockRejectedValue(
        new NotFoundException('Class not found'),
      );

      await request
        .get('/classes/999/applications')
        .set('x-test-user', 'admin')
        .expect(404);
    });
  });
});
