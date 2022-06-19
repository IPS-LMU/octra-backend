import {StandardWithTimeDto} from '../standard.dto';
import {ApiProperty, OmitType} from '@nestjs/swagger';
import {IsNotEmpty} from 'class-validator';
import {AppTokenEntity} from '@octra/server-side';

export class AppTokenDto extends StandardWithTimeDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'identifier for the app token',
    example: 'test token'
  })
  name: string;
  @IsNotEmpty()
  @ApiProperty({
    description: 'app token for client requests',
    example: '27t9VVR&/)Fv68gh8e()ZN=&b'
  })
  key: string;
  @ApiProperty({
    description: 'domains separated by comma, without \'www\'',
    example: 'exampledomain.com, exampledomain.de'
  })
  domain?: string;
  @ApiProperty({
    description: 'description of the app token',
    example: 'This token is just a test token'
  })
  description?: string;
  @ApiProperty({
    description: 'boolean that describes if registrations may be done from an app that uses this app token.'
  })
  registrations?: boolean;

  constructor(importFromDB?: Partial<AppTokenEntity>) {
    super();
    if (importFromDB) {
      Object.assign(this, importFromDB);
    }
  }
}

export class AppTokenCreateDto extends OmitType(AppTokenDto,
  ['id', 'creationdate', 'updatedate', 'key'] as const) {
}

export class AppTokenChangeDto extends OmitType(AppTokenDto,
  ['id', 'creationdate', 'updatedate', 'key', 'name'] as const) {

  @ApiProperty({
    description: 'identifier for the app token',
    example: 'test token'
  })
  name?: string;
}
