import {Module} from '@nestjs/common';
import {ToolController} from './tool.controller';

@Module({
  controllers: [ToolController],
  providers: []
})
export class ToolModule {
}
