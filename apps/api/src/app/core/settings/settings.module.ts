import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {OptionEntity} from '@octra/server-side';
import {SettingsController} from './settings.controller';
import {SettingsService} from './settings.service';

export const SETTINGS_ENTITIES = [OptionEntity];

@Module({
  imports: [TypeOrmModule.forFeature(SETTINGS_ENTITIES)],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService]
})
export class SettingsModule {
}
