import {StandardWithTimeDto} from '../standard.dto';
import {ApiProperty, ApiPropertyOptional, OmitType} from '@nestjs/swagger';

export class AppTokenDto extends StandardWithTimeDto {
  @ApiProperty()
  name: string;
  @ApiProperty()
  key: string;
  @ApiPropertyOptional()
  domain?: string;
  @ApiPropertyOptional()
  description?: string;
  @ApiPropertyOptional()
  registrations?: boolean;
}

export class AppTokenCreateDto extends OmitType(AppTokenDto,
  ['id', 'creationdate', 'updatedate'] as const) {
}
