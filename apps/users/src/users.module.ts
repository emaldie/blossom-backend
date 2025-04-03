import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { MongodbModule, PrismaModule, RedisModule } from '@blossom/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required().port(),
        DATABASE_URL: Joi.string().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        RMQ_USERS_QUEUE: Joi.string().required(),
        RMQ_URI: Joi.string().required(),
        RMQ_AUTH_QUEUE: Joi.string().required(),
        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
      }),
      envFilePath: './apps/api-gateway/.env',
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    RedisModule,
    MongodbModule,
    PrismaModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
