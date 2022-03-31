import {Controller, Delete, Get, Post, Put} from '@nestjs/common';

@Controller('app')
export class TokensController {
  @Get('tokens')
  listAppTokens(): string {
    // TODO implement function
    return 'Implementation needed';
  }

  @Post('tokens')
  createAppToken(): string {
    // TODO implement function
    return 'Implementation needed';
  }

  @Put('tokens/:id')
  changeAppToken(): string {
    // TODO implement function
    return 'Implementation needed';
  }

  @Get('tokens/:id/refresh')
  refreshAppToken(): string {
    // TODO implement function
    return 'Implementation needed';
  }

  @Delete('tokens/:id')
  removeAppToken(): string {
    // TODO implement function
    return 'Implementation needed';
  }
}
