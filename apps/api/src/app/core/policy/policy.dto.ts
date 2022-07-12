import {IsDate, IsEnum, IsNumber, IsOptional, IsString} from 'class-validator';
import {StandardDto} from '../standard.dto';
import {ApiProperty, OmitType, PartialType} from '@nestjs/swagger';
import {AccountEntity, IsOptionalString, PolicyEntity, removeProperties} from '@octra/server-side';
import {PolicyType} from '@octra/api-types';
import {Transform, Type} from 'class-transformer';
import {HasMimeType, IsFiles} from 'nestjs-form-data';
import {FileHashStorage} from '../../obj/file-hash-storage';

export class PolicyDto extends StandardDto {
  @IsEnum(PolicyType)
  type: PolicyType;
  @IsOptionalString()
  url?: string;
  @IsOptionalString()
  text?: string;
  @IsNumber()
  version: number;

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
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  publishdate?: Date;
  @IsDate()
  creationdate: Date;

  constructor(partial: Partial<PolicyEntity>) {
    super();
    partial = removeProperties(partial, ['author_id']);
    Object.assign(this, partial);
  }
}


export class PolicyCreateRequestDto extends PartialType(OmitType(PolicyDto,
  ['id', 'creationdate', 'version', 'author', 'url'] as const)) {
  @IsEnum(PolicyType)
  type: PolicyType;

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

  constructor(partial: Partial<PolicyDto>) {
    super();
    partial = removeProperties(partial, ['id', 'author']);
    Object.assign(this, partial);
  }
}
