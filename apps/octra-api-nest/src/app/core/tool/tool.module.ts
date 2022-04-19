import {Module} from '@nestjs/common';
import {ToolController} from './tool.controller';
import {ToolEntity} from './tool.entity';
import {TypeOrmModule} from '@nestjs/typeorm';

export const TOOL_ENTITIES = [ToolEntity];

@Module({
  imports: [TypeOrmModule.forFeature(TOOL_ENTITIES)],
  controllers: [ToolController],
  providers: []
})
export class ToolModule {
}
