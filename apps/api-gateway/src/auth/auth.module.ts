import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { RmqModule } from '@blossom/common';
import { AUTH_SERVICE } from '@blossom/contracts';
import { AuthService } from './auth.service';

@Module({
  imports: [RmqModule.register({ name: AUTH_SERVICE })],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
