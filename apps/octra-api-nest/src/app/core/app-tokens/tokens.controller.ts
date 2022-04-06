import {Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Request} from '@nestjs/common';
import {AppTokensService} from './app-tokens.service';
import {AppToken} from './app-tokens.entity';
import {AppTokenChangeDto, AppTokenCreateDto, AppTokenDto} from './app-token.dto';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {Roles} from '../../../../role.decorator';
import {UserRole} from '@octra/octra-api-types';

@ApiTags('App tokens')
@ApiBearerAuth()
@Controller('app')
export class TokensController {
  constructor(private readonly appTokensService: AppTokensService) {
  }

  /**
   * returns a list of app tokens.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @Roles(UserRole.administrator)
  @Get('tokens')
  async listAppTokens(@Request() req): Promise<AppTokenDto[]> {
    const t = req.user;
    return this.appTokensService.getAll();
  }

  /**
   * creates a new app token.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @Roles(UserRole.administrator)
  @Post('tokens')
  async createAppToken(@Body() token: AppTokenCreateDto): Promise<AppTokenDto> {
    return this.appTokensService.createAppToken(token);
  }

  /**
   * changes an app token.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @Roles(UserRole.administrator)
  @Put('tokens/:id')
  changeAppToken(@Body() token: AppTokenChangeDto, @Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.appTokensService.updateAppToken(id, token);
  }

  /**
   * generates and overwrites a new app token.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @Roles(UserRole.administrator)
  @Put('tokens/:id/refresh')
  async refreshAppToken(@Param('id', ParseIntPipe) id: number): Promise<AppToken> {
    return this.appTokensService.refreshAppToken(id);
  }

  /**
   * deletes an existing app token.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @Roles(UserRole.administrator)
  @Delete('tokens/:id')
  async removeAppToken(@Param('id') id: number): Promise<void> {
    return this.appTokensService.removeAppToken(id);
  }
}
