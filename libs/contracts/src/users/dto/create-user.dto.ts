import { OmitType } from '@nestjs/mapped-types';
import { UserDto } from './user.dto';

export class CreateUserDto extends OmitType(UserDto, [
  'id',
  'created_at' as const,
]) {}
