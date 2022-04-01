import {Module} from '@nestjs/common';
import {ToolsController} from './tools.controller';

@Module({
  controllers: [ToolsController],
  providers: []
})
export class ToolsModule {
}
