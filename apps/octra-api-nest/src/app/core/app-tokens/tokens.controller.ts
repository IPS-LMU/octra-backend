import {Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put} from '@nestjs/common';
import {Public} from '../../public.decorator';
import {AppTokensService} from './app-tokens.service';
import {AppTokenCreateDto, AppTokenDto} from '@octra/octra-api-types';
import {AppToken} from './app-tokens.entity';

@Controller('app')
export class TokensController {
  constructor(private readonly appTokensService: AppTokensService) {
  }

  @Public()
  @Get('tokens')
  async listAppTokens(): Promise<AppTokenDto[]> {
    return this.appTokensService.getAll();
  }

  @Post('tokens')
  async createAppToken(@Body() token: AppTokenCreateDto): Promise<AppTokenDto> {
    return this.appTokensService.createAppToken(token);
  }

  @Put('tokens/:id')
  changeAppToken(@Body() token: AppTokenDto, @Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.appTokensService.updateAppToken(id, token);
  }

  @Public()
  @Put('tokens/:id/refresh')
  async refreshAppToken(@Param('id', ParseIntPipe) id: number): Promise<AppToken> {
    return this.appTokensService.refreshAppToken(id);
  }

  @Public()
  @Delete('tokens/:id')
  async removeAppToken(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.appTokensService.removeAppToken(id);
  }
}
