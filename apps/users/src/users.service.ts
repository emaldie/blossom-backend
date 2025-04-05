import { PrismaService } from '@blossom/common';
import { CreateUserDto, UpdateUserDto } from '@blossom/contracts';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { hash } from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const currentDate = new Date().toISOString();
    createUserDto.password = await hash(createUserDto.password, 10);
    try {
      return await this.prisma.user.create({
        data: { created_at: currentDate, ...createUserDto },
      });
    } catch (err) {
      console.log(err);
    }
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(findOneUserDto: Prisma.UserWhereUniqueInput) {
    return this.prisma.user.findUniqueOrThrow({ where: findOneUserDto });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({ where: { id: id }, data: updateUserDto });
  }

  async remove(id: number) {
    return this.prisma.user.delete({ where: { id: id } });
  }
}
