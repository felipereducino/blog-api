import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cookie, { hook: 'onRequest' });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips unknown props
      forbidNonWhitelisted: true,
      transform: true, // transforms payloads to DTO classes
    }),
  );

  // CORS: adjust origins as needed
  app.enableCors({
    origin: [/^https?:\/\/localhost:\d+$/],
    credentials: true,
  });

  // Swagger (handy even without FE)
  const config = new DocumentBuilder()
    .setTitle('Blog API')
    .setDescription('Auth + Posts API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, doc);

  const port = app.get(ConfigService).get<number>('PORT') ?? 3000;
  await app.listen({ port, host: '0.0.0.0' });
}
void bootstrap();
