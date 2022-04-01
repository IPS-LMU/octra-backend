import {Controller, Post} from '@nestjs/common';

@Controller('tools')
export class ToolsController {
  @Post()
  addTool(): string {
    // TODO implement function
    return 'Implementation needed';
  }
}
