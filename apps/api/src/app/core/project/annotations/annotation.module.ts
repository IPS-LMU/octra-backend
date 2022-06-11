import {TypeOrmModule} from '@nestjs/typeorm';
import {TasksModule} from '../tasks';
import {AnnotationController} from './annotation.controller';
import {AnnotationService} from './annotation.service';
import {forwardRef, Module} from '@nestjs/common';
import {ProjectEntity} from '@octra/server-side';
import {ProjectModule} from '../project.module';

export const Annotation_ENTITIES = [ProjectEntity];

@Module({
  imports: [
    TypeOrmModule.forFeature([...Annotation_ENTITIES]),
    forwardRef(() => ProjectModule),
    TasksModule
  ],
  controllers: [AnnotationController],
  providers: [AnnotationService],
  exports: [AnnotationService, TypeOrmModule]
})
export class AnnotationModule {
}
