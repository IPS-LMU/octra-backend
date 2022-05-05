import {TranscriptDto} from './transcript.dto';
import {IsArray, IsObject, IsOptional} from 'class-validator';
import {
  IsOptionalNotEmptyString,
  IsOptionalNumber,
  IsOptionalString
} from '../../../obj/decorators/custom-validators.decorator';
import {Type} from 'class-transformer';

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
  tool_id?: number;

  /* logging data from task */
  @IsOptional()
  @IsArray()
  @IsObject({each: true})
  log?: any[];

  @IsOptional()
  @IsObject()
  @Type(() => TranscriptDto)
  transcript: TranscriptDto

  constructor(partial: Partial<TranscriptDto>) {
    Object.assign(this, partial);
  }
}
