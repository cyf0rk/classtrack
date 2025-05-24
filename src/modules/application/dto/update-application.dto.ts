import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum ApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class UpdateApplicationDto {
  @ApiProperty({
    description: 'The new status of the application',
    enum: ApplicationStatus,
    example: ApplicationStatus.APPROVED,
  })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;
} 