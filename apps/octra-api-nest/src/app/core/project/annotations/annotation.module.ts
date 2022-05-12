import {TypeOrmModule} from '@nestjs/typeorm';
import {TasksModule} from '../tasks';
import {AnnotationController} from './annotation.controller';
import {AnnotationService} from './annotation.service';
import {Module} from '@nestjs/common';
import {GlobalModule} from '../../../global.module';

export const Annotation_ENTITIES = [];

@Module({
  imports: [
    TypeOrmModule.forFeature(),
    TasksModule,
    GlobalModule
  ],
  controllers: [AnnotationController],
  providers: [AnnotationService],
  exports: [AnnotationService]
})
export class AnnotationModule {
}
