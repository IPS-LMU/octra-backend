import {Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put} from '@nestjs/common';
import {AppTokensService} from './app-tokens.service';
import {AppToken} from './app-tokens.entity';
import {AppTokenChangeDto, AppTokenCreateDto, AppTokenDto} from './app-token.dto';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';

@ApiTags('App tokens')
@ApiBearerAuth()
@Controller('app')
export class TokensController {
  constructor(private readonly appTokensService: AppTokensService) {
  }

  /**
   * returns a list of app tokens.
   */
  @Get('tokens')
  async listAppTokens(): Promise<AppTokenDto[]> {
    return this.appTokensService.getAll();
  }

  /**
   * creates a new app token.
   */
  @Post('tokens')
  async createAppToken(@Body() token: AppTokenCreateDto): Promise<AppTokenDto> {
    return this.appTokensService.createAppToken(token);
  }

  /**
   * changes an app token.
   */
  @Put('tokens/:id')
  changeAppToken(@Body() token: AppTokenChangeDto, @Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.appTokensService.updateAppToken(id, token);
  }

  /**
   * generates and overwrites a new app token.
   */
  @Put('tokens/:id/refresh')
  async refreshAppToken(@Param('id', ParseIntPipe) id: number): Promise<AppToken> {
    return this.appTokensService.refreshAppToken(id);
  }

  /**
   * deletes an existing app token.
   */
  @Delete('tokens/:id')
  async removeAppToken(@Param('id') id: number): Promise<void> {
    return this.appTokensService.removeAppToken(id);
  }
}
