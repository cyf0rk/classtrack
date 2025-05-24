import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({
    description: 'The ID of the class to apply for',
    example: 1,
  })
  @IsInt()
  @Min(1)
  classId: number;
}
