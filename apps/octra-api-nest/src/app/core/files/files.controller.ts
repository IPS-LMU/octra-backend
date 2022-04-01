import {Controller, Get, Post} from '@nestjs/common';

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
