import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateClassDto, UpdateClassDto, GetClassesQueryDto } from './dto';
import { Prisma, Class, Sport } from '../../generated/prisma';

type ClassWithSport = Class & { sport: Sport };

@Injectable()
export class ClassService {
  constructor(private prisma: PrismaService) {}

  // Convert create class dto to database model
  private toPrismaCreateInput(dto: CreateClassDto): Prisma.ClassCreateInput {
    const { sportId, ...rest } = dto;
    return {
      ...rest,
      schedule: dto.schedule as unknown as Prisma.InputJsonValue,
      sport: {
        connect: {
          id: sportId,
        },
      },
    };
  }

  // Convert update class dto to database model
  private toPrismaUpdateInput(dto: UpdateClassDto): Prisma.ClassUpdateInput {
    const { sportId, schedule, ...rest } = dto;
    const updateData: Prisma.ClassUpdateInput = { ...rest };

    if (sportId !== undefined) {
      updateData.sport = {
        connect: {
          id: sportId,
        },
      };
    }

    if (schedule !== undefined) {
      updateData.schedule = schedule as unknown as Prisma.InputJsonValue;
    }

    return updateData;
  }

  async create(dto: CreateClassDto): Promise<Class & { sport: Sport }> {
    const prismaData = this.toPrismaCreateInput(dto);
    return this.prisma.class.create({
      data: prismaData,
      include: { sport: true },
    });
  }

  async findAll(query?: GetClassesQueryDto): Promise<ClassWithSport[]> {
    const findManyArgs: Prisma.ClassFindManyArgs = {
      include: { sport: true },
    };
    
    // Only add where clause if sports are provided
    if (query?.sports && query.sports.length > 0) {
      findManyArgs.where = {
        sport: {
          name: {
            in: query.sports,
          },
        },
      };
    }

    return this.prisma.class.findMany(findManyArgs) as Promise<ClassWithSport[]>;
  }

  async findOne(id: number): Promise<Class & { sport: Sport }> {
    const classItem = await this.prisma.class.findUnique({
      where: { id },
      include: { sport: true },
    });
    if (!classItem) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return classItem;
  }

  async update(
    id: number,
    dto: UpdateClassDto,
  ): Promise<Class & { sport: Sport }> {
    await this.findOne(id);
    const prismaData = this.toPrismaUpdateInput(dto);
    return this.prisma.class.update({
      where: { id },
      data: prismaData,
      include: { sport: true },
    });
  }

  async remove(id: number): Promise<Class> {
    await this.findOne(id);
    return this.prisma.class.delete({
      where: { id },
    });
  }
}
