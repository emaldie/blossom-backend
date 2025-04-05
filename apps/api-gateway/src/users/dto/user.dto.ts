import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsString } from 'class-validator';

export class UserDto {
  @ApiProperty({ example: '1', description: 'User id' })
  @IsNumber()
  id: number;

  @ApiProperty({
    example: '2025-03-29T14:30:00Z',
    description: 'The date user was created at',
  })
  @IsDateString()
  created_at: Date;

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
