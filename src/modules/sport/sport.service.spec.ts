import { Test, TestingModule } from '@nestjs/testing';
import { SportService } from './sport.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateSportDto, UpdateSportDto } from './dto';

describe('SportService', () => {
  let service: SportService;

  const mockSport = {
    id: 1,
    name: 'Basketball',
    description: 'A team sport',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    sport: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SportService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SportService>(SportService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new sport', async () => {
      const createDto: CreateSportDto = {
        name: 'Basketball',
        description: 'A team sport',
      };

      mockPrismaService.sport.create.mockResolvedValue(mockSport);

      const result = await service.create(createDto);

      expect(mockPrismaService.sport.create).toHaveBeenCalledWith({
        data: createDto,
      });
      expect(result).toEqual(mockSport);
    });
  });

  describe('findAll', () => {
    it('should return an array of sports', async () => {
      const mockSports = [mockSport];
      mockPrismaService.sport.findMany.mockResolvedValue(mockSports);

      const result = await service.findAll();

      expect(mockPrismaService.sport.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockSports);
    });

    it('should return an empty array when no sports exist', async () => {
      mockPrismaService.sport.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(mockPrismaService.sport.findMany).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a sport by id', async () => {
      mockPrismaService.sport.findUnique.mockResolvedValue(mockSport);

      const result = await service.findOne(1);

      expect(mockPrismaService.sport.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockSport);
    });

    it('should throw NotFoundException when sport is not found', async () => {
      mockPrismaService.sport.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Sport with ID 999 not found',
      );
    });
  });

  describe('update', () => {
    it('should update a sport', async () => {
      const updateDto: UpdateSportDto = {
        name: 'Updated Basketball',
      };

      const updatedSport = { ...mockSport, ...updateDto };
      mockPrismaService.sport.update.mockResolvedValue(updatedSport);

      const result = await service.update(1, updateDto);

      expect(mockPrismaService.sport.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
      expect(result).toEqual(updatedSport);
    });

    it('should throw NotFoundException when updating non-existent sport', async () => {
      const updateDto: UpdateSportDto = {
        name: 'Updated Basketball',
      };

      mockPrismaService.sport.update.mockRejectedValue({
        code: 'P2025',
      });

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(999, updateDto)).rejects.toThrow(
        'Sport with ID 999 not found',
      );
    });
  });

  describe('remove', () => {
    it('should delete a sport', async () => {
      mockPrismaService.sport.delete.mockResolvedValue(mockSport);

      const result = await service.remove(1);

      expect(mockPrismaService.sport.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockSport);
    });

    it('should throw NotFoundException when deleting non-existent sport', async () => {
      mockPrismaService.sport.delete.mockRejectedValue({
        code: 'P2025',
      });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      await expect(service.remove(999)).rejects.toThrow(
        'Sport with ID 999 not found',
      );
    });
  });
});
