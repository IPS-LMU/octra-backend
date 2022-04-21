import {Module} from '@nestjs/common';
import {ProjectController} from './project.controller';
import {TaskEntity} from './task.entity';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ProjectEntity} from './project.entity';
import {ProjectService} from './project.service';
import {ACCOUNT_ENTITIES} from '../account/account.module';
import {AppService} from '../../app.service';
import {GuidelinesModule} from './guidelines';

export const PROJECT_ENTITIES = [TaskEntity, ProjectEntity];

@Module({
  imports: [
    TypeOrmModule.forFeature([...ACCOUNT_ENTITIES, ...PROJECT_ENTITIES]),
    GuidelinesModule
  ],
  controllers: [ProjectController],
  providers: [ProjectService, AppService],
  exports: [ProjectService]
})
export class ProjectModule {
}
