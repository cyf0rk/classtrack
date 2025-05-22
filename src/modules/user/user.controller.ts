import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from 'db';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createAdmin(@Body() createAdminUserDto: CreateAdminUserDto) {
    return await this.userService.createUser(
      createAdminUserDto.email,
      createAdminUserDto.password,
      createAdminUserDto.role,
    );
  }
}
