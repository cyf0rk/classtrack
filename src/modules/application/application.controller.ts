import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from 'db';
import type { UserResponse } from '../user/types';

interface RequestWithUser extends Request {
  user: UserResponse;
}

@ApiTags('Applications')
@ApiBearerAuth()
@Controller('applications')
@Roles(Role.USER)
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  async apply(
    @Request() req: RequestWithUser,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applicationService.apply(req.user.id, dto);
  }

  @Get('me')
  async findMyApplications(@Request() req: RequestWithUser) {
    return this.applicationService.findUserApplications(req.user.id);
  }
}
