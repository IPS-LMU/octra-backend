import {Module} from '@nestjs/common';
import {TasksService} from './tasks.service';
import {AppService} from '../../../app.service';
import {TasksController} from './tasks.controller';
import {ConfigService} from '@nestjs/config';
import {MulterModule} from '@nestjs/platform-express';
import {Configuration} from '../../../config/configuration';
import * as path from 'path';

const config = Configuration.getInstance();

@Module({
  imports: [
    MulterModule.register({
      dest: path.join(config.api.files.uploadPath, 'tmp')
    })
  ],
  controllers: [TasksController],
  providers: [TasksService, AppService, ConfigService],
  exports: [TasksService]
})
export class TasksModule {
}
