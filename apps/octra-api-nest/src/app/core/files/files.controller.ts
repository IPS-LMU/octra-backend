import {Controller, Get, Post} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  @Get()
  getFile(): string {
    // TODO implement function
    return 'Implementation needed';
  }

  @Post('upload')
  uploadFile(): string {
    // TODO implement function
    return 'Implementation needed';
  }
}
