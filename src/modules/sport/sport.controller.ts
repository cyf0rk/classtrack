import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SportService } from './sport.service';

@ApiTags('Sports')
@Controller('sports')
export class SportController {
  constructor(private readonly service: SportService) {}
}
