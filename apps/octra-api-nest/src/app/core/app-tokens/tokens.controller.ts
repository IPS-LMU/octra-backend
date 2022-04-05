import {Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put} from '@nestjs/common';
import {AppTokensService} from './app-tokens.service';
import {AppToken} from './app-tokens.entity';
import {AppTokenCreateDto, AppTokenDto} from './app-token.dto';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';

@ApiTags('App tokens')
@ApiBearerAuth()
@Controller('app')
export class TokensController {
  constructor(private readonly appTokensService: AppTokensService) {
  }

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

  @Put('tokens/:id/refresh')
  async refreshAppToken(@Param('id', ParseIntPipe) id: number): Promise<AppToken> {
    return this.appTokensService.refreshAppToken(id);
  }

  @Delete('tokens/:id')
  async removeAppToken(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.appTokensService.removeAppToken(id);
  }
}
