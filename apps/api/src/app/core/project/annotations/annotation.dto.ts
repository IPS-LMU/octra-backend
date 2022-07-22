import {IsArray, IsEnum, IsObject, IsOptional} from 'class-validator';
import {Transform} from 'class-transformer';
import {IsOptionalNotEmptyString, IsOptionalNumber, IsOptionalString, TranscriptDto} from '@octra/server-side';
import {ContentType} from '@octra/api-types';

export class SaveAnnotationDto {
  /* id for scientific issues */
  @IsOptionalNotEmptyString()
  pid?: string;
  /*  text with task related instructions or descriptions */
  @IsOptionalString()
  orgtext?: string;
  /* assessment of the user's transcription like difficulty etc. */
  @IsOptionalNotEmptyString()
  assessment?: string;
  @IsOptionalString()
  code?: string;
  /* comment by user. */
  @IsOptionalString()
  comment?: string;
  /* id of the tool that should be used for this task */
  @IsOptionalNumber()
  tool_id?: string;

  /* logging data from task */
  @IsOptional()
  @IsArray()
  @IsObject({each: true})
  log?: any[];

  @IsOptional()
  @Transform(({value}) => {
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return value;
  })
  transcript?: string;

  @IsOptional()
  @IsEnum(ContentType)
  content_type?: ContentType

  constructor(partial: Partial<TranscriptDto>) {
    Object.assign(this, partial);
  }
}
