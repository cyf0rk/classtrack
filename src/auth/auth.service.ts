import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'db';
import { UserService } from '../user/user.service';
import type { UserResponse } from '../user/types';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserResponse | null> {
    return this.userService.validateUser(email, password);
  }

  async login(user: any) {
    const payload = { email: user.email, password: user.password };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(email: string, password: string, role: Role = Role.USER) {
    return this.userService.createUser(email, password, role);
  }
}
