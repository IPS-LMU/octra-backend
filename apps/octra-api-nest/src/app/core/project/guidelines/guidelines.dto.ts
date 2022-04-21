import {IsNotEmpty, IsObject, IsString} from 'class-validator';

export class GuidelinesDto {
  @IsNotEmpty()
  @IsString()
  language: string;
  @IsNotEmpty()
  @IsObject()
  json: any;
}
