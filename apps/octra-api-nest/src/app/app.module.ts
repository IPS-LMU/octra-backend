import {Module} from '@nestjs/common';

import {AppController} from './app.controller';
import {AppService} from './app.service';
import {AuthModule} from './auth';
import {UsersModule} from './users/users.module';
import {TokensController} from './app-tokens';
import {ToolsController} from './tools';
import {ProjectsController} from './projects';
import {FilesController} from './files';
import {AppTokensModule} from './app-tokens/app-tokens.module';
import {FilesModule} from './files/files.module';
import {ProjectsModule} from './projects/projects.module';
import {ToolsModule} from './tools/tools.module';
import {APP_GUARD} from '@nestjs/core';
import {JwtAuthGuard} from './auth/jwt-auth.guard';

@Module({
  imports: [AuthModule, AppTokensModule, FilesModule, UsersModule, ProjectsModule, ToolsModule],
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
