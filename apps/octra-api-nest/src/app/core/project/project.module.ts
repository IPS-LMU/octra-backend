import {forwardRef, Module} from '@nestjs/common';
import {ProjectController} from './project.controller';
import {TaskEntity, TaskInputOutputEntity} from './task.entity';
import {TypeOrmModule} from '@nestjs/typeorm';
import {FileProjectEntity, ProjectEntity} from './project.entity';
import {ProjectService} from './project.service';
import {ACCOUNT_ENTITIES} from '../account/account.module';
import {GuidelinesModule} from './guidelines';
import {TasksModule} from './tasks';
import {GlobalModule} from '../../global.module';

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
