import {StandardWithTimeDto} from '../standard.dto';
import {ApiProperty, OmitType, PartialType} from '@nestjs/swagger';
import {IsNotEmpty} from 'class-validator';
import {AppTokenEntity, IsOptionalBoolean, IsOptionalString} from '@octra/server-side';

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

  @IsOptionalString()
  @ApiProperty({
    description: 'domains separated by comma, without \'www\'',
    example: 'exampledomain.com, exampledomain.de'
  })
  domain?: string;

  @IsOptionalString()
  @ApiProperty({
    description: 'description of the app token',
    example: 'This token is just a test token'
  })
  description?: string;

  @IsOptionalBoolean()
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

export class AppTokenCreateDto extends PartialType(OmitType(AppTokenDto,
  ['id', 'creationdate', 'updatedate', 'key'] as const)) {
}

export class AppTokenChangeDto extends PartialType(OmitType(AppTokenDto,
  ['id', 'creationdate', 'updatedate', 'key', 'name'] as const)) {

  @ApiProperty({
    description: 'identifier for the app token',
    example: 'test token'
  })
  name?: string;

  @IsOptionalString()
  @ApiProperty({
    description: 'domains separated by comma, without \'www\'',
    example: 'exampledomain.com, exampledomain.de'
  })
  domain?: string;

  @IsOptionalString()
  @ApiProperty({
    description: 'description of the app token',
    example: 'This token is just a test token'
  })
  description?: string;

  @IsOptionalBoolean()
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
