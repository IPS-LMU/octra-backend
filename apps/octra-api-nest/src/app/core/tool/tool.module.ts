import {Module} from '@nestjs/common';
import {ToolController} from './tool.controller';
import {ToolEntity} from './tool.entity';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ToolService} from './tool.service';
import {AppService} from '../../app.service';

export const TOOL_ENTITIES = [ToolEntity];

@Module({
  imports: [TypeOrmModule.forFeature(TOOL_ENTITIES)],
  controllers: [ToolController],
  providers: [ToolService, AppService],
  exports: [ToolService]
})
export class ToolModule {
}
