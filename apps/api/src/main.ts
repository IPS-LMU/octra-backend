/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import {ConfigLoader} from './config-loader';
import {version} from '../package.json'
import {Logger, ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import * as bodyParser from 'body-parser';

import {AppModule} from './app/app.module';
import {ConfigService} from '@nestjs/config';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {RedocModule, RedocOptions} from 'nestjs-redoc';
import * as fs from 'fs';
import {environment} from './environments/environment';
import helmet from 'helmet';
import * as path from 'path';
import {IAPIConfiguration} from '@octra/server-side';
import {getConfigPath} from './app/functions';
import {IntroView} from './app/view/intro.view';
import {NestExpressApplication} from '@nestjs/platform-express';

new ConfigLoader();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose']
  });
  const configService = app.get(ConfigService);
  const config = configService.get<IAPIConfiguration>('api');
  app.enableShutdownHooks();
  app.setGlobalPrefix(config.baseURL);

  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false // TODO find a better way to remove script-src
  }));
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

  const port = config.port;

  if (config.plugins?.reference?.enabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('OCTRA API')
      .setDescription(IntroView)
      .setVersion(version)
      .addBearerAuth()
      .addSecurity('roles', {
        type: 'http',
        scheme: 'bearer'
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
          tags: ['Authentication', 'App tokens', 'Accounts', 'Projects', 'Tasks', 'Annotations', 'Guidelines', 'Tools', 'Files']
        }
      ],
      requiredPropsFirst: true
    };

    if (config.plugins?.reference?.protection) {
      redocOptions.auth = {
        enabled: config.plugins.reference.protection.enabled,
        user: config.plugins.reference.protection.username,
        password: config.plugins.reference.protection.password
      }
    }

    const document = SwaggerModule.createDocument(app, swaggerConfig, {
      ignoreGlobalPrefix: false,
      operationIdFactory: (controllerKey, methodKey) => methodKey
    });

    if (environment.development) {
      fs.writeFileSync(path.join(getConfigPath(), 'swagger-spec.json'), JSON.stringify(document));
    }
    await RedocModule.setup(config.baseURL + 'reference', app, document, redocOptions);
  }

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    enableDebugMessages: true,
    forbidNonWhitelisted: true,
    disableErrorMessages: false
  }));

  app.setBaseViewsDir(path.join(__dirname, (environment.production) ? '' : '..', 'views'));
  app.setViewEngine('ejs');

  app.enableCors();
  await app.listen(port, config.host);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}${config.baseURL}reference`
  );
}

bootstrap();
