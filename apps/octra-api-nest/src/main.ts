/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import {Logger, ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';

import {AppModule} from './app/app.module';
import {ConfigService} from '@nestjs/config';
import {IAPIConfiguration} from './app/config/configuration';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';

async function bootstrap() {
  const globalPrefix = 'v1';
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(globalPrefix);
  const configService = app.get(ConfigService);
  const config = configService.get<IAPIConfiguration>('api');
  const port = config.port;
  const swaggerConfig = new DocumentBuilder()
    .setTitle('OCTRA API')
    .setDescription('API for connecting OCTRA Backend to OCTRA')
    .setVersion('0.2.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    ignoreGlobalPrefix: false
  });
  app.useGlobalPipes(new ValidationPipe({
    transform: true
  }));
  SwaggerModule.setup('v1/reference', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha'
    }
  });
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
