import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateClassDto, UpdateClassDto } from './dto';
import { Prisma } from '../../generated/prisma';

@Injectable()
export class ClassService {
  constructor(private prisma: PrismaService) {}

  // Convert create class dto to database model
  private toPrismaCreateInput(dto: CreateClassDto): Prisma.ClassCreateInput {
    const { sportId, ...rest } = dto;
    return {
      ...rest,
      schedule: JSON.parse(JSON.stringify(dto.schedule)),
      sport: {
        connect: {
          id: sportId,
        },
      },
    };
  }

  // Convert update class dto to database model
  private toPrismaUpdateInput(dto: UpdateClassDto): Prisma.ClassUpdateInput {
    const updateData: any = { ...dto };

    if (dto.sportId !== undefined) {
      updateData.sport = {
        connect: {
          id: dto.sportId,
        },
      };
      delete updateData.sportId;
    }

    if (dto.schedule !== undefined) {
      updateData.schedule = JSON.parse(JSON.stringify(dto.schedule));
    }

    return updateData;
  }

  async create(dto: CreateClassDto) {
    const prismaData = this.toPrismaCreateInput(dto);
    return this.prisma.class.create({
      data: prismaData,
    });
  }

  async findAll() {
    return this.prisma.class.findMany({ include: { sport: true } });
  }

  async findOne(id: number) {
    const classItem = await this.prisma.class.findUnique({
      where: { id },
      include: { sport: true },
    });
    if (!classItem)
      throw new NotFoundException(`Class with ID ${id} not found`);
    return classItem;
  }

  async update(id: number, dto: UpdateClassDto) {
    await this.findOne(id);
    const prismaData = this.toPrismaUpdateInput(dto);
    return this.prisma.class.update({
      where: { id },
      data: prismaData,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.class.delete({ where: { id } });
  }
}
