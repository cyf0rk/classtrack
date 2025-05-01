import { IsEnum } from 'class-validator';
import { Role } from 'db';
import { CreateUserDto } from './create-user.dto';

export class CreateAdminUserDto extends CreateUserDto {
  @IsEnum(Role)
  role: Role;
}
