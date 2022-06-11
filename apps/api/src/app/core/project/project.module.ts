import {forwardRef, Module} from '@nestjs/common';
import {ProjectController} from './project.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ProjectService} from './project.service';
import {GuidelinesModule} from './guidelines';
import {TasksModule} from './tasks';
import {FileProjectEntity, ProjectEntity, TaskEntity, TaskInputOutputEntity} from '@octra/server-side';
import {AnnotationModule} from './annotations/annotation.module';

export const PROJECT_ENTITIES = [TaskEntity, ProjectEntity, FileProjectEntity, TaskInputOutputEntity];

@Module({
  imports: [
    TypeOrmModule.forFeature([...PROJECT_ENTITIES]),
    forwardRef(() => GuidelinesModule),
    forwardRef(() => AnnotationModule),
    forwardRef(() => TasksModule)
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService]
})
export class ProjectModule {
}
