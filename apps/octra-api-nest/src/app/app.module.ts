import {Module} from '@nestjs/common';

import {AppController} from './app.controller';
import {AppService} from './app.service';
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
import {Configuration} from './config/configuration';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AppTokenEntity} from './core/app-token/app-token.entity';
import {RolesGuard} from './core/authorization/roles.guard';
import {AppTokenOriginGuard} from './obj/guards/app-token-origin.guard';
import {ThrottlerGuard, ThrottlerModule} from '@nestjs/throttler';
import {ShutdownService} from './shutdown.service';
import {TASK_ENTITIES} from './core/project/tasks';

const config = Configuration.getInstance();

@Module({
  imports: [
    AuthModule,
    AppTokenModule,
    FilesModule,
    AccountModule,
    ProjectModule,
    ToolModule,
    ConfigModule.forRoot({
      load: [() => (config)],
      ignoreEnvFile: true,
      isGlobal: true
    }),
    TypeOrmModule.forRoot({
      type: config.database.dbType,
      host: config.database.dbHost,
      port: config.database.dbPort,
      username: config.database.dbUser,
      password: config.database.dbPassword,
      database: config.database.dbName,
      synchronize: false,
      entities: [AppTokenEntity, ...ACCOUNT_ENTITIES, ...PROJECT_ENTITIES, ...TOOL_ENTITIES, ...FILE_ENTITIES, ...TASK_ENTITIES],
      keepConnectionAlive: true
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
  ],
  controllers: [AppController, AppTokenController, FilesController, ProjectController, ToolController],
  providers: [
    AppService,
    ShutdownService,
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
    }

  ],
})
export class AppModule {
}
