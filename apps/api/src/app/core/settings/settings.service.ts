import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {OptionEntity} from '@octra/server-side';
import {GeneralSettingsDto} from './settings.dto';

@Injectable()
export class SettingsService {
  constructor(@InjectRepository(OptionEntity)
              private optionRepository: Repository<OptionEntity>) {
  }

  async getGeneralSettings(): Promise<GeneralSettingsDto> {
    const entries = await this.optionRepository.find();
    if (entries.length > 0) {
      entries.filter(a => a.name !== 'db_version');
      const settings: GeneralSettingsDto = {};
      for (const entry of entries) {
        settings[entry.name] = entry.value;
      }
      return new GeneralSettingsDto(settings);
    }
    return new GeneralSettingsDto({});
  }

  async saveGeneralSettings(dto: GeneralSettingsDto): Promise<void> {
    for (const name of Object.keys(dto).filter(a => a !== 'id')) {
      const item = await this.optionRepository.findOneBy({
        name
      });
      if (item) {
        await this.optionRepository.update({
          name
        }, {
          name,
          value: (Array.isArray(dto[name]) || typeof dto[name] === 'object') ? JSON.stringify(dto[name]) : dto[name]
        });
      } else {
        await this.optionRepository.insert({
          name,
          value: dto[name]
        });
      }
    }
  }
}
