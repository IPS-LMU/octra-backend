import {Body, Controller, Get, Put} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {CombinedRoles} from '../../obj/decorators/combine.decorators';
import {AccountRole} from '@octra/api-types';
import {SettingsService} from './settings.service';
import {GeneralSettingsDto} from './settings.dto';
import {removeNullAttributes} from '@octra/server-side';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private toolService: SettingsService) {
  }

  /**
   * lists all general settings;
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Get('general')
  async getGeneralSettings(): Promise<GeneralSettingsDto> {
    return removeNullAttributes(await this.toolService.getGeneralSettings());
  }

  /**
   * saves the general settings.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Put('general')
  async saveGeneralSettings(@Body() dto: GeneralSettingsDto): Promise<void> {
    return await this.toolService.saveGeneralSettings(removeNullAttributes(dto));
  }
}
