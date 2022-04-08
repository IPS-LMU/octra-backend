import {Controller, Post} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('Tools')
@Controller('tool')
export class ToolController {
  @Post()
  addTool(): string {
    // TODO implement function
    return 'Implementation needed';
  }
}
