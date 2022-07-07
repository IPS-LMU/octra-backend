import {IsArray, IsOptional, IsString} from 'class-validator';
import {IsOptionalString} from '@octra/server-side';
import {instanceToPlain, plainToInstance, Transform} from 'class-transformer';

export class LanguageURLMapping {
  @IsString()
  language: string;
  @IsString()
  url: string;

  constructor(partial: Partial<LanguageURLMapping>) {
    Object.assign(this, partial);
  }
}

export class GeneralSettingsDto {
  @IsOptionalString()
  mail_support_address?: string;

  @IsOptional()
  @IsArray()
  @Transform(({value}) => {
    if (!value) {
      return value;
    }
    if (Array.isArray(value)) {
      return instanceToPlain(value)
    } else if (typeof value === 'string') {
      console.log(value)
      return JSON.parse(value);
    }
    return value;
  })
  data_policy_urls?: LanguageURLMapping[];
  @IsOptional()
  @IsArray()
  @Transform(({value}) => {
    if (!value) {
      return value;
    }
    if (Array.isArray(value)) {
      return instanceToPlain(value)
    } else if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  terms_conditions_urls?: LanguageURLMapping[];

  constructor(entries: Partial<GeneralSettingsDto>) {
    Object.assign(this, plainToInstance(GeneralSettingsDto, entries));
  }
}
