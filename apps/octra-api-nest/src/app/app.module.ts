import {Module} from '@nestjs/common';

import {AppController} from './app.controller';
import {AppService} from './app.service';
import {AuthModule} from './core/auth';
import {UsersModule} from './core/users/users.module';
import {TokensController} from './core/app-tokens';
import {ToolsController} from './core/tools';
import {ProjectsController} from './core/projects';
import {FilesController} from './core/files';
import {AppTokensModule} from './core/app-tokens/app-tokens.module';
import {FilesModule} from './core/files/files.module';
import {ProjectsModule} from './core/projects/projects.module';
import {ToolsModule} from './core/tools/tools.module';
import {APP_GUARD} from '@nestjs/core';
import {JwtAuthGuard} from './core/auth/jwt-auth.guard';
import {ConfigModule} from '@nestjs/config';
import {Configuration} from './config/configuration';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AppToken} from './core/app-tokens/app-tokens.entity';

const config = Configuration.getInstance();

@Module({
  imports: [
    AuthModule,
    AppTokensModule,
    FilesModule,
    UsersModule,
    ProjectsModule,
    ToolsModule,
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
      entities: [AppToken]
    })
  ],
  controllers: [AppController, TokensController, FilesController, ProjectsController, ToolsController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    }
  ],
})
export class AppModule {
}
