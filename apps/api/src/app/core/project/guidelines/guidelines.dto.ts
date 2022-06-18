import {IsNotEmpty, IsObject, IsString} from 'class-validator';

export class GuidelinesDto {
  @IsNotEmpty()
  @IsString()
  language: string;
  @IsNotEmpty()
  @IsObject()
  json: any; // TODO add class for GuidelinesJSON

  constructor(data: Partial<GuidelinesDto>) {
    Object.assign(this, data);
  }
}
