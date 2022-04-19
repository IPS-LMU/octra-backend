/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import {Logger} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';

import {AppModule} from './app/app.module';
import {ConfigService} from '@nestjs/config';
import {IAPIConfiguration} from './app/config/configuration';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {RedocModule, RedocOptions} from 'nestjs-redoc';
import * as fs from 'fs';
import {environment} from './environments/environment';
import {CustomValidationPipe} from './app/obj/pipes/custom-validation.pipe';

async function bootstrap() {
  const globalPrefix = 'v1';
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(globalPrefix);
  const configService = app.get(ConfigService);
  const config = configService.get<IAPIConfiguration>('api');
  const port = config.port;

  if (config.reference.enabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('OCTRA API')
      .setDescription('API for connecting OCTRA Backend to OCTRA')
      .setVersion('0.2.0')
      .addBearerAuth()
      .addSecurity('roles', {
        type: 'http'
      })
      .build();
    let redocOptions: RedocOptions = {
      title: 'OCTRA API',
      logo: {
        url: 'https://www.phonetik.uni-muenchen.de/apps/octra/octra/assets/img/socialmedia/octra_logo_twitter.jpg'
      },
      tagGroups: [
        {
          name: 'v1',
          tags: ['Authentication', 'Accounts', 'App tokens', 'Projects', 'Tools', 'Files']
        }
      ],
      requiredPropsFirst: true
    };

    if (config.reference.protection) {
      redocOptions.auth = {
        enabled: true,
        user: config.reference.protection.username,
        password: config.reference.protection.password
      }
    }

    const document = SwaggerModule.createDocument(app, swaggerConfig, {
      ignoreGlobalPrefix: false,
      operationIdFactory: (controllerKey, methodKey) => methodKey
    });

    if (environment.development) {
      fs.writeFileSync('./dist/swagger-spec.json', JSON.stringify(document));
    }
    await RedocModule.setup('/v1/reference', app, document, redocOptions);
  }

  app.useGlobalPipes(new CustomValidationPipe());

  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}/reference`
  );
}

bootstrap();
