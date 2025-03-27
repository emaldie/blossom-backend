import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { MongodbModule, RedisModule, RmqModule } from '@blossom/common';

@Module({
  imports: [
    UsersModule,
    AuthModule,
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
    RmqModule,
    RedisModule,
    MongodbModule,
  ],
})
export class ApiGatewayModule {}
