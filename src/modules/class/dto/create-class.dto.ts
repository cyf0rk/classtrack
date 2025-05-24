import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ScheduleDto } from './schedule.dto';

export class CreateClassDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  sportId: number;

  @ApiProperty({ example: 'Advanced Basketball' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Master professional techniques' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: {
      Monday: [
        { startTime: '10:00', duration: 60 },
        { startTime: '16:00', duration: 90 },
      ],
      Wednesday: [{ startTime: '17:30', duration: 60 }],
    },
    description: 'Each day maps to an array of sessions',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => ScheduleDto)
  schedule: ScheduleDto;

  @ApiProperty({ example: 20 })
  @IsNumber()
  capacity: number;
}
