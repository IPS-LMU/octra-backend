import {Module} from '@nestjs/common';
import {ToolController} from './tool.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ToolService} from './tool.service';
import {ToolEntity} from '@octra/server-side';

export const TOOL_ENTITIES = [ToolEntity];

@Module({
  imports: [TypeOrmModule.forFeature(TOOL_ENTITIES)],
  controllers: [ToolController],
  providers: [ToolService],
  exports: [ToolService]
})
export class ToolModule {
}
