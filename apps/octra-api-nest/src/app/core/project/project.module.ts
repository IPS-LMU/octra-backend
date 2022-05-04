import {Module} from '@nestjs/common';
import {ProjectController} from './project.controller';
import {TaskEntity, TaskInputOutputEntity} from './task.entity';
import {TypeOrmModule} from '@nestjs/typeorm';
import {FileProjectEntity, ProjectEntity} from './project.entity';
import {ProjectService} from './project.service';
import {ACCOUNT_ENTITIES} from '../account/account.module';
import {AppService} from '../../app.service';
import {GuidelinesModule} from './guidelines';
import {TasksModule} from './tasks';
import {DatabaseService} from "../../database.service";

export const PROJECT_ENTITIES = [TaskEntity, ProjectEntity, FileProjectEntity, TaskInputOutputEntity];

@Module({
  imports: [
    TypeOrmModule.forFeature([...ACCOUNT_ENTITIES, ...PROJECT_ENTITIES]),
    GuidelinesModule,
    TasksModule
  ],
  controllers: [ProjectController],
  providers: [ProjectService, AppService, DatabaseService],
  exports: [ProjectService]
})
export class ProjectModule {
}
