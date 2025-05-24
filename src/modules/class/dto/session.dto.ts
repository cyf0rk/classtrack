import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Matches, Min, Max } from 'class-validator';

export class SessionDto {
  @ApiProperty({ example: '16:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Invalid time format (use HH:mm)',
  })
  startTime: string;

  @ApiProperty({ example: 90 })
  @IsNumber()
  @Min(1)
  @Max(600)
  duration: number;
}
