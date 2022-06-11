import {forwardRef, Module} from '@nestjs/common';
import {GuidelinesController} from './guidelines.controller';
import {GuidelinesService} from './guidelines.service';
import {ProjectModule} from '../project.module';

@Module({
  imports: [
    forwardRef(() => ProjectModule),
  ],
  controllers: [GuidelinesController],
  providers: [GuidelinesService],
  exports: [GuidelinesService]
})
export class GuidelinesModule {
}
