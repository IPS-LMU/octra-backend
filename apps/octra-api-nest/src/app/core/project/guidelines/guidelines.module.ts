import {Module} from '@nestjs/common';
import {GuidelinesController} from './guidelines.controller';
import {GuidelinesService} from './guidelines.service';
import {GlobalModule} from '../../../global.module';

@Module({
  imports: [GlobalModule],
  controllers: [GuidelinesController],
  providers: [GuidelinesService],
  exports: [GuidelinesService]
})
export class GuidelinesModule {
}
