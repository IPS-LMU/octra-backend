import {Body, Controller, Delete, Get, Param, Post, Put} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {AccountRole} from '@octra/api-types';
import {AccountFieldsService} from './account-fields.service';
import {CombinedRoles} from '../../../obj/decorators/combine.decorators';
import {AccountFieldDefinitionCreateDto, AccountFieldDefinitionDto} from './account-fields.dto';
import {NumericStringValidationPipe} from '../../../obj/pipes/numeric-string-validation.pipe';

@ApiTags('Accounts')
@ApiBearerAuth()
@Controller('fields')
export class AccountFieldsController {
  constructor(private accountFieldsService: AccountFieldsService) {
  }

  /**
   * saves a new account field definition.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Post('')
  async createAccountFieldDefinition(@Body() dto: AccountFieldDefinitionCreateDto): Promise<AccountFieldDefinitionDto> {
    return new AccountFieldDefinitionDto(await this.accountFieldsService.createOrSaveFieldDefinition(dto));
  }

  /**
   * saves a new account field definition.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Put(':field_id')
  async saveAccountFieldDefinition(@Param('field_id', NumericStringValidationPipe) field_id: string, @Body() dto: AccountFieldDefinitionCreateDto): Promise<AccountFieldDefinitionDto> {
    return new AccountFieldDefinitionDto(await this.accountFieldsService.createOrSaveFieldDefinition(dto, field_id));
  }

  /**
   * removes an existing field definition.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Delete(':field_id')
  async removeAccountFieldDefinition(@Param('field_id', NumericStringValidationPipe) field_id: string): Promise<void> {
    return this.accountFieldsService.removeFieldDefinition(field_id);
  }

  /**
   * returns a field definition.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Get(':field_id')
  async getAccountFieldDefinition(@Param('field_id', NumericStringValidationPipe) field_id: string): Promise<AccountFieldDefinitionDto> {
    return new AccountFieldDefinitionDto(await this.accountFieldsService.getFieldDefinition(field_id));
  }


  /**
   * list field definitions.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Get('')
  async listAccountFieldDefinitions(): Promise<AccountFieldDefinitionDto[]> {
    return (await this.accountFieldsService.listFieldDefinitions()).map((a) => new AccountFieldDefinitionDto(a));
  }
}
