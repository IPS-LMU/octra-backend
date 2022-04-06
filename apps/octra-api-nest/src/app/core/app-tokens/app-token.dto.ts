import {StandardWithTimeDto} from '../standard.dto';
import {OmitType} from '@nestjs/swagger';
import {IsNotEmpty} from 'class-validator';

export class AppTokenDto extends StandardWithTimeDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  key: string;
  domain?: string;
  description?: string;
  registrations?: boolean;
}

export class AppTokenCreateDto extends OmitType(AppTokenDto,
  ['id', 'creationdate', 'updatedate'] as const) {
}

export class AppTokenChangeDto extends OmitType(AppTokenDto,
  ['id', 'creationdate', 'updatedate', 'key'] as const) {
}
