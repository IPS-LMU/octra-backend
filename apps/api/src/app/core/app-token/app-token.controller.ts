import {Body, Controller, Delete, Get, Param, Post, Put} from '@nestjs/common';
import {AppTokenService} from './app-token.service';
import {AppTokenChangeDto, AppTokenCreateDto, AppTokenDto} from './app-token.dto';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {AccountRole} from '@octra/api-types';
import {CombinedRoles} from '../../obj/decorators/combine.decorators';
import {NumericStringValidationPipe} from '../../obj/pipes/numeric-string-validation.pipe';

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
   *
   */
  @CombinedRoles(AccountRole.administrator)
  @Get('tokens')
  async listAppTokens(): Promise<AppTokenDto[]> {
    return (await this.appTokensService.getAll()).map(a => (new AppTokenDto(a)));
  }

  /**
   * returns one specific app token.
   *
   * Allowed user roles: <code>administrator</code>
   *
   */
  @CombinedRoles(AccountRole.administrator)
  @Get('tokens/:id')
  async getAppToken(@Param('id', NumericStringValidationPipe) id: string): Promise<AppTokenDto> {
    return new AppTokenDto(await this.appTokensService.getOne(id));
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
  async changeAppToken(@Body() token: AppTokenChangeDto, @Param('id', NumericStringValidationPipe) id: string): Promise<void> {
    return this.appTokensService.updateAppToken(id, token);
  }

  /**
   * overwrites an existing app token with a new auto-generated token.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Put('tokens/:id/refresh')
  async refreshAppToken(@Param('id', NumericStringValidationPipe) id: string): Promise<AppTokenDto> {
    return new AppTokenDto(await this.appTokensService.refreshAppToken(id));
  }

  /**
   * deletes an existing app token.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Delete('tokens/:id')
  async removeAppToken(@Param('id', NumericStringValidationPipe) id: string): Promise<void> {
    return this.appTokensService.removeAppToken(id);
  }
}
