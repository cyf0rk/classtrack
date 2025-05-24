import { Test, TestingModule } from '@nestjs/testing';
import { ClassController } from './class.controller';
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { ScheduleDto } from './dto/schedule.dto';
import { SessionDto } from './dto/session.dto';
import * as request from 'supertest';
import { Express } from 'express';

describe('ClassController', () => {
  let app: INestApplication;
  let httpServer: Express;

  const mockClassService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
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
      ],
    }).compile();

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
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('POST /classes', () => {
    it('should create a class with valid data', async () => {
      const expectedResult = { id: 1, ...validCreateDto };
      mockClassService.create.mockResolvedValue(expectedResult);

      const response = await request(httpServer)
        .post('/classes')
        .send(validCreateDto)
        .expect(201);

      expect(response.body).toEqual(expectedResult);
      expect(mockClassService.create).toHaveBeenCalledWith(validCreateDto);
    });

    it('should return 400 when sportId is missing', async () => {
      const { sportId: _sportId, ...invalidDto } = validCreateDto;

      await request(httpServer).post('/classes').send(invalidDto).expect(400);
    });

    it('should return 400 when title is empty', async () => {
      const invalidDto = { ...validCreateDto, title: '' };

      await request(httpServer).post('/classes').send(invalidDto).expect(400);
    });

    it('should return 400 when capacity is not a number', async () => {
      const invalidDto = { ...validCreateDto, capacity: '20' };

      await request(httpServer).post('/classes').send(invalidDto).expect(400);
    });

    it('should return 400 when schedule is invalid', async () => {
      const invalidSchedule: Partial<ScheduleDto> = {
        Monday: [{ startTime: 'invalid', duration: 60 } as SessionDto],
      };
      const invalidDto = {
        ...validCreateDto,
        schedule: invalidSchedule as ScheduleDto,
      };

      await request(httpServer).post('/classes').send(invalidDto).expect(400);
    });
  });

  describe('GET /classes', () => {
    it('should return an array of classes', async () => {
      const expectedResult = [
        { id: 1, ...validCreateDto },
        { id: 2, ...validCreateDto },
      ];
      mockClassService.findAll.mockResolvedValue(expectedResult);

      const response = await request(httpServer).get('/classes').expect(200);

      expect(response.body).toEqual(expectedResult);
      expect(mockClassService.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /classes/:id', () => {
    it('should return a class by id', async () => {
      const expectedResult = { id: 1, ...validCreateDto };
      mockClassService.findOne.mockResolvedValue(expectedResult);

      const response = await request(httpServer).get('/classes/1').expect(200);

      expect(response.body).toEqual(expectedResult);
      expect(mockClassService.findOne).toHaveBeenCalledWith(1);
    });

    it('should return 400 when id is not a number', async () => {
      await request(httpServer).get('/classes/invalid').expect(400);
    });
  });

  describe('PATCH /classes/:id', () => {
    it('should update a class with valid data', async () => {
      const expectedResult = { id: 1, ...validCreateDto, ...validUpdateDto };
      mockClassService.update.mockResolvedValue(expectedResult);

      const response = await request(httpServer)
        .patch('/classes/1')
        .send(validUpdateDto)
        .expect(200);

      expect(response.body).toEqual(expectedResult);
      expect(mockClassService.update).toHaveBeenCalledWith(1, validUpdateDto);
    });

    it('should return 400 when id is not a number', async () => {
      await request(httpServer)
        .patch('/classes/invalid')
        .send(validUpdateDto)
        .expect(400);
    });

    it('should return 400 when update data is invalid', async () => {
      const invalidDto = { ...validUpdateDto, capacity: 'invalid' };

      await request(httpServer)
        .patch('/classes/1')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('DELETE /classes/:id', () => {
    it('should remove a class by id', async () => {
      const expectedResult = { id: 1, ...validCreateDto };
      mockClassService.remove.mockResolvedValue(expectedResult);

      const response = await request(httpServer)
        .delete('/classes/1')
        .expect(200);

      expect(response.body).toEqual(expectedResult);
      expect(mockClassService.remove).toHaveBeenCalledWith(1);
    });

    it('should return 400 when id is not a number', async () => {
      await request(httpServer).delete('/classes/invalid').expect(400);
    });
  });
});
