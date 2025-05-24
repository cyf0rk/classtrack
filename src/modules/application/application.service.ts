import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaService) {}
}
