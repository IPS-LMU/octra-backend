import {forwardRef, Module} from '@nestjs/common';
import {TasksService} from './tasks.service';
import {TasksController} from './tasks.controller';
import * as path from 'path';
import {TypeOrmModule} from '@nestjs/typeorm';
import {NestjsFormDataModule} from 'nestjs-form-data';
import {FileHashStorage} from '../../../obj/file-hash-storage';
import {Configuration, FileEntity, TaskEntity} from '@octra/server-side';
import {getConfigPath} from '../../../functions';
import {ProjectModule} from '../project.module';

export const TASK_ENTITIES = [TaskEntity, FileEntity];
const config = Configuration.getInstance(
  getConfigPath()
);

@Module({
  imports: [
    TypeOrmModule.forFeature([...TASK_ENTITIES]),
    NestjsFormDataModule.config({
      storage: FileHashStorage,
      fileSystemStoragePath: path.join(config.api.paths.uploadFolder, 'tmp')
    }),
    forwardRef(() => ProjectModule)
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService, TypeOrmModule]
})
export class TasksModule {
}
