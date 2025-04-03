import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto, USERS_PATTERNS, USERS_SERVICE } from '@blossom/contracts';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_SERVICE) private readonly usersClient: ClientProxy,
  ) {}
  async create(createUserDto: CreateUserDto) {
    console.log('2 step');
    return await lastValueFrom(
      this.usersClient.send<UserDto>(USERS_PATTERNS.CREATE, createUserDto),
    );
  }

  async findAll() {
    return await lastValueFrom(
      this.usersClient.send<UserDto[] | null>(USERS_PATTERNS.FIND_ALL, {}),
    );
  }

  async findOne(id: number) {
    return await lastValueFrom(
      this.usersClient.send<UserDto | null>(USERS_PATTERNS.FIND_ONE, {
        id: id,
      }),
    );
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await lastValueFrom(
      this.usersClient.send(USERS_PATTERNS.UPDATE, {
        id: id,
        data: updateUserDto,
      }),
    );
  }

  async remove(id: number) {
    return await lastValueFrom(
      this.usersClient.send<UserDto | null>(USERS_PATTERNS.REMOVE, id),
    );
  }
}
