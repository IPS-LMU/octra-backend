import {CacheInterceptor, CacheModule, MiddlewareConsumer, Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AuthModule} from './core/authentication';
import {AccountModule} from './core/account/account.module';
import {AppTokenController} from './core/app-token';
import {ToolController} from './core/tool';
import {ProjectController} from './core/project';
import {FilesController} from './core/files';
import {AppTokenModule} from './core/app-token/app-token.module';
import {FilesModule} from './core/files/files.module';
import {ProjectModule} from './core/project/project.module';
import {ToolModule} from './core/tool/tool.module';
import {APP_GUARD, APP_INTERCEPTOR} from '@nestjs/core';
import {JwtAuthGuard} from './core/authentication/jwt-auth.guard';
import {ConfigModule} from '@nestjs/config';
import {TypeOrmModule, TypeOrmModuleOptions} from '@nestjs/typeorm';
import {RolesGuard} from './core/authorization/roles.guard';
import {AppTokenOriginGuard} from './obj/guards/app-token-origin.guard';
import {ThrottlerGuard, ThrottlerModule} from '@nestjs/throttler';
import {ShutdownService} from './shutdown.service';
import {LoggerMiddleware} from './obj/logger.middleware';
import {GlobalModule} from './global.module';
import {Configuration, getOrmConfig} from '@octra/server-side';
import {ServeStaticModule} from '@nestjs/serve-static';
import {join} from 'path';
import {SettingsModule} from './core/settings/settings.module';
import {PolicyModule} from './core/policy/policy.module';
import {ProjectFieldsModule} from './core/project/fields';
import {AcceptLanguageResolver, I18nModule, QueryResolver} from 'nestjs-i18n';
import {FieldsManagmentModule} from './core/fields';

const config = Configuration.getInstance();
console.log(getOrmConfig(config));
const TypeORMOptions: TypeOrmModuleOptions = {
  ...getOrmConfig(config),
  keepConnectionAlive: true,
  autoLoadEntities: true,
  logging: 'error'
};

@Module({
  imports: [
    CacheModule.register({
      ttl: 5,
      max: 50
    }),
    TypeOrmModule.forRoot(TypeORMOptions),
    AuthModule,
    AppTokenModule,
    FilesModule,
    AccountModule,
    ProjectModule,
    ToolModule,
    PolicyModule,
    SettingsModule,
    FieldsManagmentModule,
    ProjectFieldsModule,
    ConfigModule.forRoot({
      load: [() => (config)],
      ignoreEnvFile: true,
      isGlobal: true
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    GlobalModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'assets'),
      serveRoot: join(config.api.baseURL, 'assets')
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: join(__dirname, (process.env['test'] ? '..' : ''), 'assets', 'i18n'),
        watch: false,
      },
      resolvers: [
        {use: QueryResolver, options: ['lang']},
        AcceptLanguageResolver,
      ],
      viewEngine: 'ejs'
    }),
  ],
  controllers: [AppController, AppTokenController, FilesController, ProjectController, ToolController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AppTokenOriginGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    ShutdownService
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    if (config.api.debugging) {
      consumer
        .apply(LoggerMiddleware)
        .forRoutes('*');
    }
  }
}
