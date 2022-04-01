import {Controller, Delete, Get, Post, Put} from '@nestjs/common';
import {Public} from '../public.decorator';

@Controller('app')
export class TokensController {
  @Public()
  @Get('tokens')
  async listAppTokens(): Promise<string> {
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
