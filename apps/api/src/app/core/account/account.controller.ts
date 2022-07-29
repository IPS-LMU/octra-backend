import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseInterceptors
} from '@nestjs/common';
import {Request} from 'express';
import {ApiBearerAuth, ApiResponse, ApiTags} from '@nestjs/swagger';
import {AccountRole} from '@octra/api-types';
import {
  AccountCreateRequestDto,
  AccountDto,
  AccountRegisterRequestDto,
  AssignRoleDto,
  ChangePasswordDto
} from './account.dto';
import {CombinedRoles} from '../../obj/decorators/combine.decorators';
import {AccountService} from './account.service';
import {InternRequest} from '../../obj/types';
import {Public} from '../authorization/public.decorator';
import {NumericStringValidationPipe} from '../../obj/pipes/numeric-string-validation.pipe';
import {removeNullAttributes} from '@octra/server-side';
import {CustomApiException} from '../../obj/decorators/api-exception.decorators';
import {BadRequestException, NotFoundException} from '../../obj/exceptions';
import {AccountFieldManagementService} from '../fields';

@ApiTags('Accounts')
@ApiBearerAuth()
@Controller('account')
export class AccountController {
  constructor(private accountService: AccountService, private accountFieldService: AccountFieldManagementService) {
  }

  /**
   * returns a list of existing accounts.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Get()
  async listAccounts(@Req() req: Request): Promise<AccountDto[]> {
    return (await this.accountService.getAll()).map(a => removeNullAttributes(new AccountDto(a)));
  }

  @CombinedRoles(AccountRole.administrator, AccountRole.user)
  @Post('complete-profile')
  async completeProfile(@Body() body: any, @Req() req: InternRequest): Promise<void> {
    return await this.accountFieldService.saveAccountFieldValuesForUser(req.user.userId, body);
  }

  /**
   * returns information about the own account.
   *
   * Allowed user roles: <code>administrator, user</code>
   */
  @CombinedRoles(AccountRole.administrator, AccountRole.user)
  @Get('current')
  async getCurrentAccountInformation(@Req() req: InternRequest): Promise<AccountDto> {
    return new AccountDto(await this.accountService.getAccount(req.user.userId));
  }

  /**
   * changes the roles of a user with a specific ID.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @CustomApiException(new NotFoundException(`Can't find any account with this id.`))
  @Put(':id/roles')
  async assignAccountRoles(@Param('id', NumericStringValidationPipe) id: string, @Body() assignDto: AssignRoleDto): Promise<AssignRoleDto> {
    return this.accountService.assignAccountRoles(id, assignDto);
  }

  /**
   * changes the password of the current account.
   */
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({status: HttpStatus.NOT_FOUND, description: 'Can\'t find the account with the specified ID.'})
  @CustomApiException(new BadRequestException('Incorrect old password.'))
  @CustomApiException(new NotFoundException('Can\'t find account with this id'))
  @Put('password')
  async changeMyPassword(@Req() req: InternRequest, @Body() changePasswordDto: ChangePasswordDto): Promise<void> {
    return this.accountService.changePassword(req.user.userId, changePasswordDto);
  }

  /**
   * searches an account with a given hash. Only needed if the hash is used as uuid (e.g. for Shibboleth).
   */
  @Public()
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('hash/:hash')
  async existsWithHash(@Param('hash') hash: string): Promise<boolean> {
    return (await this.accountService.findAccountByHash(hash) !== null);
  }

  /**
   * returns information about a specific account.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @CustomApiException(new NotFoundException(`Can't find any account with this id.`))
  @Get(':id')
  async getAccountInformation(@Param('id', NumericStringValidationPipe) id: string): Promise<AccountDto | undefined> {
    return removeNullAttributes(new AccountDto(await this.accountService.findAccountByID(id)));
  }

  @CombinedRoles(AccountRole.administrator)
  @CustomApiException(new NotFoundException(`Can't find any account with this id.`))
  @Delete(':id')
  removeAccount(@Param('id', NumericStringValidationPipe) id: string): Promise<void> {
    return this.accountService.removeAccount(id);
  }

  /**
   * creates a new account.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Post('')
  async createAccount(@Body() dto: AccountCreateRequestDto): Promise<AccountDto> {
    const result = await this.accountService.createAccount(dto);
    return removeNullAttributes(new AccountDto(result));
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Public()
  @Post('register')
  async registerAccount(@Body() dto: AccountRegisterRequestDto): Promise<AccountDto> {
    const result = await this.accountService.createAccount(dto);
    return removeNullAttributes(new AccountDto(result));
  }
}
