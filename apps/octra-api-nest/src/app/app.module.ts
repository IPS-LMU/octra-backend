import {Module} from '@nestjs/common';

import {AppController} from './app.controller';
import {AppService} from './app.service';
import {FilesController, ProjectsController, TokensController, ToolsController, UsersController} from './controllers';

@Module({
  imports: [],
  controllers: [AppController, TokensController, FilesController, UsersController, ProjectsController, ToolsController],
  providers: [AppService],
})
export class AppModule {
}
