import {IsNotEmpty, IsOptional, IsString} from 'class-validator';
import {StandardWithTimeDto} from '../standard.dto';
import {removeProperties} from '../../functions';
import {OmitType} from '@nestjs/swagger';

export class ToolDto extends StandardWithTimeDto {
  @IsNotEmpty()
  name: string;
  @IsOptional()
  @IsString()
  version?: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsString()
  pid?: string;

  constructor(partial: Partial<ToolDto>) {
    super();
    Object.assign(this, partial);
  }
}

export class ToolCreateRequestDto extends OmitType(ToolDto,
  ['id', 'creationdate', 'updatedate'] as const) {
  constructor(partial: Partial<ToolDto>) {
    super();
    partial = removeProperties(partial, ['id']);
    Object.assign(this, partial);
  }
}
