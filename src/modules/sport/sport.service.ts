import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSportDto, UpdateSportDto } from './dto';

@Injectable()
export class SportService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSportDto) {
    return this.prisma.sport.create({ data: dto });
  }

  async findAll() {
    return this.prisma.sport.findMany();
  }

  async findOne(id: number) {
    const sport = await this.prisma.sport.findUnique({ where: { id } });
    if (!sport) {
      throw new NotFoundException(`Sport with ID ${id} not found`);
    }
    return sport;
  }

  async update(id: number, dto: UpdateSportDto) {
    try {
      return await this.prisma.sport.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Sport with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.sport.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Sport with ID ${id} not found`);
      }
      throw error;
    }
  }
}
