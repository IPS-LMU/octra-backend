import {Module} from '@nestjs/common';
import {TasksService} from './tasks.service';
import {AppService} from '../../../app.service';
import {TasksController} from './tasks.controller';
import {ConfigService} from '@nestjs/config';
import {Configuration} from '../../../config/configuration';
import * as path from 'path';
import {TypeOrmModule} from '@nestjs/typeorm';
import {TaskEntity} from '../task.entity';
import {FILE_ENTITIES} from '../../files/files.module';
import {NestjsFormDataModule} from 'nestjs-form-data';
import {FileHashStorage} from '../../../obj/file-hash-storage';

export const TASK_ENTITIES = [TaskEntity];
const config = Configuration.getInstance();

@Module({
  imports: [
    TypeOrmModule.forFeature([...TASK_ENTITIES, ...FILE_ENTITIES]),
    NestjsFormDataModule.config({
      storage: FileHashStorage,
      fileSystemStoragePath: path.join(config.api.files.uploadPath, 'tmp')
    })
  ],
  controllers: [TasksController],
  providers: [TasksService, AppService, ConfigService],
  exports: [TasksService]
})
export class TasksModule {
}
