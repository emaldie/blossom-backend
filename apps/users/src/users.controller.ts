import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateUserDto,
  UpdateUserDto,
  USERS_PATTERNS,
} from '@blossom/contracts';
import { Prisma } from '@prisma/client';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern(USERS_PATTERNS.CREATE)
  async create(@Payload() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @MessagePattern(USERS_PATTERNS.FIND_ALL)
  async findAll() {
    return await this.usersService.findAll();
  }

  @MessagePattern(USERS_PATTERNS.FIND_ONE)
  async findOne(@Payload() findOneUserDto: Prisma.UserWhereUniqueInput) {
    return await this.usersService.findOne(findOneUserDto);
  }

  @MessagePattern(USERS_PATTERNS.REMOVE)
  async remove(@Payload() id: number) {
    return await this.usersService.remove(id);
  }

  @MessagePattern(USERS_PATTERNS.UPDATE)
  async update(@Payload() payload: { id: number; data: UpdateUserDto }) {
    return await this.usersService.update(payload.id, payload.data);
  }
}
