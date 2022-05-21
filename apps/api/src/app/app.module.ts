import {MiddlewareConsumer, Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AuthModule} from './core/authentication';
import {ACCOUNT_ENTITIES, AccountModule} from './core/account/account.module';
import {AppTokenController} from './core/app-token';
import {ToolController} from './core/tool';
import {ProjectController} from './core/project';
import {FilesController} from './core/files';
import {AppTokenModule} from './core/app-token/app-token.module';
import {FILE_ENTITIES, FilesModule} from './core/files/files.module';
import {PROJECT_ENTITIES, ProjectModule} from './core/project/project.module';
import {TOOL_ENTITIES, ToolModule} from './core/tool/tool.module';
import {APP_GUARD} from '@nestjs/core';
import {JwtAuthGuard} from './core/authentication/jwt-auth.guard';
import {ConfigModule} from '@nestjs/config';
import {TypeOrmModule, TypeOrmModuleOptions} from '@nestjs/typeorm';
import {RolesGuard} from './core/authorization/roles.guard';
import {AppTokenOriginGuard} from './obj/guards/app-token-origin.guard';
import {ThrottlerGuard, ThrottlerModule} from '@nestjs/throttler';
import {ShutdownService} from './shutdown.service';
import {TASK_ENTITIES} from './core/project/tasks';
import {LoggerMiddleware} from './obj/logger.middleware';
import {AnnotationModule} from './core/project/annotations/annotation.module';
import {GlobalModule} from './global.module';
import {AppTokenEntity, Configuration, getOrmConfig} from '@octra/server-side';

console.log('load config in app.module');
const config = Configuration.getInstance();

const TypeORMOptions: TypeOrmModuleOptions = {
  ...getOrmConfig(config),
  entities: [AppTokenEntity, ...ACCOUNT_ENTITIES, ...PROJECT_ENTITIES, ...TOOL_ENTITIES, ...FILE_ENTITIES, ...TASK_ENTITIES],
  keepConnectionAlive: true,
  logging: 'error'
};


@Module({
  imports: [
    AuthModule,
    AppTokenModule,
    FilesModule,
    AccountModule,
    ProjectModule,
    AnnotationModule,
    ToolModule,
    ConfigModule.forRoot({
      load: [() => (config)],
      ignoreEnvFile: true,
      isGlobal: true
    }),
    TypeOrmModule.forRoot(TypeORMOptions),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    GlobalModule
  ],
  controllers: [AppController, AppTokenController, FilesController, ProjectController, ToolController],
  providers: [
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
