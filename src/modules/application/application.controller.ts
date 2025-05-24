import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApplicationService } from './application.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from 'db';

@ApiTags('Applications')
@ApiBearerAuth()
@Controller('applications')
@Roles(Role.USER)
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}
}
