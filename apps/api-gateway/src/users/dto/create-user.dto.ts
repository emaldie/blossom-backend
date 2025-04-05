import { OmitType } from '@nestjs/mapped-types';
import { UserDto } from './user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateUserDto extends OmitType(UserDto, [
  'created_at',
  'id' as const,
]) {
  @ApiProperty({ example: 'John Doe', description: 'User name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'johndoe@gmail.com', description: 'User email' })
  @IsString()
  email: string;

  @ApiProperty({
    example: 'ASDiojnWEkjncsJKH738Sbdbawk',
    description: 'User hashed password',
  })
  @IsString()
  password: string;
}
