import {Module} from '@nestjs/common';
import {TasksService} from './tasks.service';
import {TasksController} from './tasks.controller';
import * as path from 'path';
import {TypeOrmModule} from '@nestjs/typeorm';
import {FILE_ENTITIES} from '../../files/files.module';
import {NestjsFormDataModule} from 'nestjs-form-data';
import {FileHashStorage} from '../../../obj/file-hash-storage';
import {GlobalModule} from '../../../global.module';
import {Configuration, TaskEntity} from '@octra/server-side';
import {getConfigPath} from '../../../functions';

export const TASK_ENTITIES = [TaskEntity];
console.log('load config in tasks.module');
const config = Configuration.getInstance(
  getConfigPath()
);

@Module({
  imports: [
    TypeOrmModule.forFeature([...TASK_ENTITIES, ...FILE_ENTITIES]),
    NestjsFormDataModule.config({
      storage: FileHashStorage,
      fileSystemStoragePath: path.join(config.api.files.uploadPath, 'tmp')
    }),
    GlobalModule
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService, TypeOrmModule]
})
export class TasksModule {
}
