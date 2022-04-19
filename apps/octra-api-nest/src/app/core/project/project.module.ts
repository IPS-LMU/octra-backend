import {Module} from '@nestjs/common';
import {ProjectController} from './project.controller';
import {TaskEntity} from './task.entity';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ProjectEntity} from './project.entity';
import {ProjectService} from './project.service';

export const PROJECT_ENTITIES = [TaskEntity, ProjectEntity];

@Module({
  imports: [TypeOrmModule.forFeature(PROJECT_ENTITIES)],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService]
})
export class ProjectModule {
}
