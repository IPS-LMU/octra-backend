import {Module} from '@nestjs/common';
import {TasksService} from './tasks.service';
import {TasksController} from './tasks.controller';
import * as path from 'path';
import {dirname} from 'path';
import {TypeOrmModule} from '@nestjs/typeorm';
import {TaskEntity} from '../task.entity';
import {FILE_ENTITIES} from '../../files/files.module';
import {NestjsFormDataModule} from 'nestjs-form-data';
import {FileHashStorage} from '../../../obj/file-hash-storage';
import {GlobalModule} from '../../../global.module';
import {Configuration} from "@octra/server-side";
import {environment} from "../../../../environments/environment";

export const TASK_ENTITIES = [TaskEntity];
const config = Configuration.getInstance(
  (environment.production) ? dirname(process.execPath) : __dirname
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
