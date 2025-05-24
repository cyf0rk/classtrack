import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from 'db';
import type { UserResponse } from '../user/types';
import { UpdateApplicationDto } from './dto/update-application.dto';

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
  @ApiOperation({ summary: 'Apply for a class' })
  @ApiResponse({
    status: 201,
    description: 'Successfully applied for the class',
  })
  @ApiResponse({ status: 400, description: 'Invalid request or class is full' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  @ApiResponse({ status: 409, description: 'Already applied for this class' })
  async apply(
    @Request() req: RequestWithUser,
    @Body() dto: CreateApplicationDto,
  ) {
    return await this.applicationService.apply(req.user.id, dto);
  }

  @Get('me')
  @ApiOperation({ summary: "Get current user's applications" })
  @ApiResponse({
    status: 200,
    description: "Returns list of user's applications",
  })
  async findMyApplications(@Request() req: RequestWithUser) {
    return await this.applicationService.findUserApplications(req.user.id);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update application status (admin only)' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({
    status: 200,
    description: 'Application status updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid status or class is full' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApplicationDto,
  ) {
    return await this.applicationService.updateStatus(id, dto);
  }
}
