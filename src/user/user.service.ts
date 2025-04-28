import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from 'db';

type UserResponse = Omit<User, 'password'>;

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  private omitPassword(user: User): UserResponse {
    const { password: _, ...result } = user;
    return result;
  }

  async createUser(
    email: string,
    password: string,
    role = 'user',
  ): Promise<UserResponse> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
    });
    return this.omitPassword(user);
  }

  async findByEmail(email: string): Promise<UserResponse | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.omitPassword(user) : null;
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserResponse | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      return this.omitPassword(user);
    }
    return null;
  }
}
