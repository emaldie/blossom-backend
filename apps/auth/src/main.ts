import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AuthModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RMQ_URI],
      queue: process.env.RMQ_AUTH_QUEUE,
    },
  });
  await app.listen();
}
bootstrap();
