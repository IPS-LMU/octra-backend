import {AccountFieldDefinitionEntity, AccountFieldValueEntity, IsOptionalString} from '@octra/server-side';
import {IsBoolean, IsEnum, IsInstance, IsNumber, IsString} from 'class-validator';
import {AccountFieldContext, AccountFieldDefinition, AccountFieldDefinitionType} from '@octra/api-types';
import {ApiProperty, OmitType} from '@nestjs/swagger';
import {StandardDto} from '../standard.dto';

export class AccountFieldValueDto extends StandardDto {
  @IsString()
  name: string;
  @IsString()
  value: string;
  @IsOptionalString()
  project_id?: string;

  constructor(partial: Partial<AccountFieldValueEntity>) {
    super();
    Object.assign(this, partial);
  }
}

export class AccountFieldDefinitionDto extends StandardDto {
  @ApiProperty({
    description: 'Context where this field is going to be visible'
  })
  @IsEnum(AccountFieldContext)
  context: AccountFieldContext;
  @ApiProperty({
    description: 'Unique name of the definition'
  })
  @IsString()
  name: string;
  @ApiProperty({
    description: 'Type of the control which is used for this definition'
  })
  @IsEnum(AccountFieldDefinitionType)
  type: AccountFieldDefinitionType;
  @ApiProperty({
    description: 'Schema that is used to generate the control'
  })
  @IsInstance(AccountFieldDefinition)
  definition: AccountFieldDefinition;
  @ApiProperty({
    description: 'Describes if administrators or project administrators may delete this definition'
  })
  @IsBoolean()
  removable: boolean;
  @ApiProperty({
    description: 'Describes if the control is visible or not'
  })
  @IsBoolean()
  active: boolean;
  @ApiProperty({
    description: 'Sort order of the definition'
  })
  @IsNumber()
  sort_order: number;

  constructor(partial: Partial<AccountFieldDefinitionEntity>) {
    super();
    Object.assign(this, partial);
  }
}

export class AccountFieldDefinitionCreateDto extends OmitType(AccountFieldDefinitionDto, ['id', 'removable']) {
  constructor(partial: Partial<AccountFieldDefinitionEntity>) {
    super();
    Object.assign(this, partial);
  }
}
