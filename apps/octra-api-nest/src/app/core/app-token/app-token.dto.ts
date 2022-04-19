import {StandardWithTimeDto} from '../standard.dto';
import {OmitType} from '@nestjs/swagger';
import {IsNotEmpty} from 'class-validator';
import {AppTokenEntity} from './app-token.entity';

export class AppTokenDto extends StandardWithTimeDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  key: string;
  domain?: string;
  description?: string;
  registrations?: boolean;

  constructor(importFromDB?: Partial<AppTokenEntity>) {
    super();
    if (importFromDB) {
      Object.assign(this, importFromDB);
    }
  }
}

export class AppTokenCreateDto extends OmitType(AppTokenDto,
  ['id', 'creationdate', 'updatedate'] as const) {
  @IsNotEmpty()
  key: string;
}

export class AppTokenChangeDto extends OmitType(AppTokenDto,
  ['id', 'creationdate', 'updatedate', 'key'] as const) {
}
