import {forwardRef, Module} from '@nestjs/common';
import {ProjectController} from './project.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ProjectService} from './project.service';
import {ACCOUNT_ENTITIES} from '../account/account.module';
import {GuidelinesModule} from './guidelines';
import {TasksModule} from './tasks';
import {GlobalModule} from '../../global.module';
import {FileProjectEntity, ProjectEntity, TaskEntity, TaskInputOutputEntity} from '@octra/server-side';

export const PROJECT_ENTITIES = [TaskEntity, ProjectEntity, FileProjectEntity, TaskInputOutputEntity];

@Module({
  imports: [
    TypeOrmModule.forFeature([...ACCOUNT_ENTITIES, ...PROJECT_ENTITIES]),
    GuidelinesModule,
    forwardRef(() => TasksModule),
    GlobalModule
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService, TasksModule, TypeOrmModule]
})
export class ProjectModule {
}
