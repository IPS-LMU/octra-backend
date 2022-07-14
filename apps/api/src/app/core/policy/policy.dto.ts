import {IsArray, IsDate, IsEnum, IsNumber, IsOptional, IsString} from 'class-validator';
import {StandardDto} from '../standard.dto';
import {ApiProperty, OmitType, PartialType} from '@nestjs/swagger';
import {
  AccountEntity,
  IsOptionalString,
  PolicyEntity,
  PolicyTranslationEntity,
  removeProperties
} from '@octra/server-side';
import {PolicyType} from '@octra/api-types';
import {Transform, Type} from 'class-transformer';
import {HasMimeType, IsFiles} from 'nestjs-form-data';
import {FileHashStorage} from '../../obj/file-hash-storage';

export class PolicyDto extends StandardDto {
  @IsEnum(PolicyType)
  type: PolicyType;
  @IsNumber()
  version: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  publishdate?: Date;
  @IsDate()
  creationdate: Date;

  @IsArray()
  @Transform(({value}) => {
    return value?.map(a => new PolicyTranslationDto(a));
  })
  translations: PolicyTranslationDto[];

  constructor(partial: Partial<PolicyEntity>) {
    super();
    partial = removeProperties(partial, ['author_id']);
    Object.assign(this, partial);
  }
}


export class PolicyCreateRequestDto extends PartialType(OmitType(PolicyDto,
  ['id', 'creationdate', 'version', 'translations'] as const)) {
  @IsEnum(PolicyType)
  type: PolicyType;

  constructor(partial: Partial<PolicyDto>) {
    super();
    partial = removeProperties(partial, ['id']);
    Object.assign(this, partial);
  }
}

export class PolicyTranslationViewDto {
  @IsString()
  url: string;

  @IsString()
  text: string;

  @IsString()
  type: PolicyType;
}

export class PolicyTranslationDto extends StandardDto {
  @IsString()
  language: string;

  @IsOptionalString()
  url?: string;
  @IsOptionalString()
  text?: string;

  @IsString()
  @Transform(({value}: { value: AccountEntity }) => {
    if (!value) {
      return value;
    }
    return value.account_person.username;
  })
  @ApiProperty({
    description: 'author\'s username'
  })
  author: string;

  @IsDate()
  updatedate: Date;
  @IsDate()
  creationdate: Date;

  constructor(partial: Partial<PolicyTranslationEntity>) {
    super();
    const obj = removeProperties(partial, ['author_id', 'policy_id', 'policy']);
    Object.assign(this, obj);
  }
}

export class PolicyCreateTranslationDto extends PartialType(OmitType(PolicyTranslationDto,
  ['id', 'creationdate', 'updatedate', 'author'] as const)) {
  @IsString()
  language: string;

  /**
   * the input files
   */
  @Transform(({value}) => {
    return (value !== undefined && !Array.isArray(value)) ? [value] : value;
  })
  @IsOptional()
  @IsFiles()
  @HasMimeType(['application/pdf', 'text/html', 'text/plain'], {each: true})
  inputs?: FileHashStorage[];

  constructor(partial: Partial<PolicyTranslationEntity>) {
    super();
    partial = removeProperties(partial, ['author_id', 'creationdate', 'author', 'policy_id']);
    Object.assign(this, partial);
  }
}
