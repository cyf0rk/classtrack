import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSportDto {
  @ApiProperty({ example: 'Basketball', description: 'The name of the sport' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false, example: 'Team sport played with a ball', description: 'Description of the sport' })
  @IsString()
  @IsOptional()
  description?: string;
} 