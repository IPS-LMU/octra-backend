import {IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested} from 'class-validator';
import {Type} from 'class-transformer';
import {IsOptionalNumber, IsOptionalString} from '../typeorm/decorators';

export class TranscriptDto {
  @IsOptionalString()
  name!: string;
  @IsOptionalString()
  annotates!: string;
  @IsOptionalNumber()
  sampleRate!: number;
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => Level)
  levels!: Level[];
  @IsOptional()
  @IsArray()
  links!: Link[];

  constructor(partial: Partial<TranscriptDto>) {
    Object.assign(this, partial);
  }
}

export enum AnnotJSONType {
  'ITEM' = 'ITEM',
  'EVENT' = 'EVENT',
  'SEGMENT' = 'SEGMENT'
}

export class Level {
  @IsNotEmpty()
  @IsString()
  name!: string;
  @IsNotEmpty()
  @IsEnum(AnnotJSONType)
  type!: AnnotJSONType;
  @IsNotEmpty()
  @IsArray()
  items!: Item[];
}

export class Item {
  @IsNotEmpty()
  @IsNumber()
  id!: number;
  sampleStart?: number;
  sampleDur?: number;
  samplePoint?: number;
  @IsArray()
  labels!: Label[];
}

export class Segment extends Item {
  override sampleStart!: number;
  override sampleDur!: number;
}

export class Event extends Item {
  override samplePoint!: number;
}

export class Label {
  @IsString()
  @IsNotEmpty()
  name!: string;
  @IsString()
  value!: string;
}

export class Link {
  @IsNotEmpty()
  @IsNumber()
  fromID!: number;
  @IsNotEmpty()
  @IsNumber()
  toID!: number;
}
