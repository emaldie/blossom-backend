import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RmqModule } from '@blossom/common';
import { USERS_SERVICE } from '@blossom/contracts';

@Module({
  imports: [RmqModule.register({ name: USERS_SERVICE })],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
