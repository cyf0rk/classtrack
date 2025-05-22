import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsObject } from 'class-validator';

export class CreateClassDto {
  @ApiProperty({ example: 'Advanced Basketball' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Master professional techniques' })
  @IsString()
  description: string;

  @ApiProperty({
    example: {
      days: ['Monday', 'Wednesday'],
      startTime: '18:00',
      duration: 90,
    },
  })
  @IsObject()
  schedule: object;

  @ApiProperty({ example: 20 })
  @IsNumber()
  capacity: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  sportId: number;
}
