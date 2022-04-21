import {Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put} from '@nestjs/common';
import {AppTokenService} from './app-token.service';
import {AppTokenChangeDto, AppTokenCreateDto, AppTokenDto} from './app-token.dto';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {AccountRole} from '@octra/octra-api-types';
import {CombinedRoles} from '../../../combine.decorators';

@ApiTags('App tokens')
@ApiBearerAuth()
@Controller('app')
export class AppTokenController {
  constructor(private readonly appTokensService: AppTokenService) {
  }

  /**
   * returns a list of app tokens.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Get('tokens')
  async listAppTokens(): Promise<AppTokenDto[]> {
    return (await this.appTokensService.getAll()).map(a => (new AppTokenDto(a)));
  }

  /**
   * creates a new app token.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Post('tokens')
  async createAppToken(@Body() token: AppTokenCreateDto): Promise<AppTokenDto> {
    return new AppTokenDto(await this.appTokensService.createAppToken(token));
  }

  /**
   * changes an app token.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Put('tokens/:id')
  changeAppToken(@Body() token: AppTokenChangeDto, @Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.appTokensService.updateAppToken(id, token);
  }

  /**
   * generates and overwrites a new app token.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Put('tokens/:id/refresh')
  async refreshAppToken(@Param('id', ParseIntPipe) id: number): Promise<AppTokenDto> {
    return new AppTokenDto(await this.appTokensService.refreshAppToken(id));
  }

  /**
   * deletes an existing app token.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Delete('tokens/:id')
  async removeAppToken(@Param('id') id: number): Promise<void> {
    return this.appTokensService.removeAppToken(id);
  }
}
