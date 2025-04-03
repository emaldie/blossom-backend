import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ example: 'John Doe', description: 'User name' })
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'johndoe@gmail.com',
    description: 'User email',
  })
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    example: 'ASDiojnWEkjncsJKH738Sbdbawk',
    description: 'User hashed password',
  })
  @IsString()
  password?: string;
}
