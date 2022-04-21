import {Module} from '@nestjs/common';
import {GuidelinesController} from './guidelines.controller';
import {GuidelinesService} from './guidelines.service';
import {AppService} from '../../../app.service';

@Module({
  imports: [],
  controllers: [GuidelinesController],
  providers: [GuidelinesService, AppService],
  exports: [GuidelinesService]
})
export class GuidelinesModule {
}
