import {IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested} from 'class-validator';
import {IsOptionalNumber, IsOptionalString} from '../../../obj/decorators/custom-validators.decorator';
import {Type} from 'class-transformer';


export enum TranscriptType {
  'Text' = 'Text',
  'AnnotJSON' = 'AnnotJSON'
}

export class TranscriptDto {
  @IsOptionalString()
  name: string;
  @IsOptionalString()
  annotates: string;
  @IsOptionalNumber()
  sampleRate: number;
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => Level)
  levels!: Level[];
  @IsOptional()
  @IsArray()
  links: Link[];

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
  id: number;
  sampleStart?: number;
  sampleDur?: number;
  samplePoint?: number;
  @IsArray()
  labels: Label[];
}

export class Segment extends Item {
  sampleStart: number;
  sampleDur: number;
}

export class Event extends Item {
  samplePoint: number;
}

export class Label {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  value: string;
}

export class Link {
  @IsNotEmpty()
  @IsNumber()
  fromID: number;
  @IsNotEmpty()
  @IsNumber()
  toID: number;
}
