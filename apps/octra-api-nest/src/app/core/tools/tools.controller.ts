import {Controller, Post} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('Tools')
@Controller('tools')
export class ToolsController {
  @Post()
  addTool(): string {
    // TODO implement function
    return 'Implementation needed';
  }
}
