import { Test, TestingModule } from '@nestjs/testing';
import { ClassService } from './class.service';
import { PrismaService } from '../../database/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { NotFoundException } from '@nestjs/common';
import { ScheduleDto } from './dto/schedule.dto';

describe('ClassService', () => {
  let service: ClassService;

  const mockPrismaService = {
    class: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
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

  const mockClass = {
    id: 1,
    ...validCreateDto,
    sport: {
      id: 1,
      name: 'Basketball',
      description: 'Basketball sport',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ClassService>(ClassService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a class with valid data', async () => {
      mockPrismaService.class.create.mockResolvedValue(mockClass);

      const result = await service.create(validCreateDto);

      expect(result).toEqual(mockClass);
      expect(mockPrismaService.class.create).toHaveBeenCalledWith({
        data: {
          title: validCreateDto.title,
          description: validCreateDto.description,
          capacity: validCreateDto.capacity,
          schedule: validSchedule,
          sport: {
            connect: {
              id: validCreateDto.sportId,
            },
          },
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of classes with their sports', async () => {
      const mockClasses = [mockClass, { ...mockClass, id: 2 }];
      mockPrismaService.class.findMany.mockResolvedValue(mockClasses);

      const result = await service.findAll();

      expect(result).toEqual(mockClasses);
      expect(mockPrismaService.class.findMany).toHaveBeenCalledWith({
        include: { sport: true },
      });
    });
  });

  describe('findOne', () => {
    it('should return a class by id', async () => {
      mockPrismaService.class.findUnique.mockResolvedValue(mockClass);

      const result = await service.findOne(1);

      expect(result).toEqual(mockClass);
      expect(mockPrismaService.class.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { sport: true },
      });
    });

    it('should throw NotFoundException when class is not found', async () => {
      mockPrismaService.class.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.class.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        include: { sport: true },
      });
    });
  });

  describe('update', () => {
    it('should update a class with valid data', async () => {
      mockPrismaService.class.findUnique.mockResolvedValue(mockClass);
      const updatedClass = { ...mockClass, ...validUpdateDto };
      mockPrismaService.class.update.mockResolvedValue(updatedClass);

      const result = await service.update(1, validUpdateDto);

      expect(result).toEqual(updatedClass);
      expect(mockPrismaService.class.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          title: validUpdateDto.title,
          capacity: validUpdateDto.capacity,
        },
      });
    });

    it('should update a class with sport change', async () => {
      mockPrismaService.class.findUnique.mockResolvedValue(mockClass);
      const updateWithSport = { ...validUpdateDto, sportId: 2 };
      const updatedClass = { ...mockClass, ...updateWithSport };
      mockPrismaService.class.update.mockResolvedValue(updatedClass);

      const result = await service.update(1, updateWithSport);

      expect(result).toEqual(updatedClass);
      expect(mockPrismaService.class.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          title: updateWithSport.title,
          capacity: updateWithSport.capacity,
          sport: {
            connect: {
              id: updateWithSport.sportId,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when updating non-existent class', async () => {
      mockPrismaService.class.findUnique.mockResolvedValue(null);

      await expect(service.update(999, validUpdateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.class.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a class by id', async () => {
      mockPrismaService.class.findUnique.mockResolvedValue(mockClass);
      mockPrismaService.class.delete.mockResolvedValue(mockClass);

      const result = await service.remove(1);

      expect(result).toEqual(mockClass);
      expect(mockPrismaService.class.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when removing non-existent class', async () => {
      mockPrismaService.class.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.class.delete).not.toHaveBeenCalled();
    });
  });
});
