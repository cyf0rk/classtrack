import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { Role } from 'db';
import { UserService } from './user.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createAdmin(@Body() createAdminUserDto: CreateAdminUserDto) {
    return this.userService.createUser(
      createAdminUserDto.email,
      createAdminUserDto.password,
      createAdminUserDto.role,
    );
  }
}
