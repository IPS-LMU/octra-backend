import {TypeOrmModule} from '@nestjs/typeorm';
import {TasksModule} from '../tasks';
import {AnnotationController} from './annotation.controller';
import {AnnotationService} from './annotation.service';
import {Module} from '@nestjs/common';

export const Annotation_ENTITIES = [];

@Module({
  imports: [
    TypeOrmModule.forFeature(),
    TasksModule
  ],
  controllers: [AnnotationController],
  providers: [AnnotationService],
  exports: [AnnotationService]
})
export class AnnotationModule {
}
