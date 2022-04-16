import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseInterceptors
} from '@nestjs/common';
import {Request} from 'express';
import {ApiBearerAuth, ApiResponse, ApiTags} from '@nestjs/swagger';
import {UserRole} from '@octra/octra-api-types';
import {AccountDto, AssignRoleDto, ChangePasswordDto} from './account.dto';
import {CombinedRoles} from '../../../combine.decorators';
import {AccountService} from './account.service';
import {InternRequest} from '../../obj/types';
import {Public} from '../authorization/public.decorator';
import {removeNullAttributes} from '../../functions';

@ApiTags('Accounts')
@ApiBearerAuth()
@Controller('account')
export class AccountController {
  constructor(private accountService: AccountService) {
  }

  /**
   * returns a list of existing accounts.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(UserRole.administrator)
  @Get()
  async listUsers(@Req() req: Request): Promise<AccountDto[]> {
    return (await this.accountService.getAll()).map(a => new AccountDto(a));
  }

  /**
   * returns information about the own account.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @Get('current')
  async getCurrentUserInformation(@Req() req: InternRequest): Promise<AccountDto> {
    return new AccountDto(await this.accountService.getUser(req.user.userId));
  }

  /**
   * changes the roles of a user with a specific ID.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(UserRole.administrator)
  @Put(':id/roles')
  async assignUserRoles(@Param('id', ParseIntPipe) id: number, @Body() assignDto: AssignRoleDto): Promise<AssignRoleDto> {
    return this.accountService.assignUserRoles(id, assignDto);
  }

  /**
   * changes the password of the current account.
   */
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Old password does not match the password from the database.'
  })
  @ApiResponse({status: HttpStatus.NOT_FOUND, description: 'Can\'t find the account with the specified ID.'})
  @Put('password')
  async changeMyPassword(@Req() req: InternRequest, @Body() changePasswordDto: ChangePasswordDto): Promise<void> {
    return this.accountService.changePassword(req.user.userId, changePasswordDto);
  }

  /**
   * searches an account with a given hash. Only needed if the hash is used as uuid (e.g. for Shibboleth).
   */
  @Public()
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('hash')
  async existsWithHash(@Query() hash: string): Promise<boolean> {
    return (await this.accountService.findAccountByHash(hash) !== undefined);
  }

  /**
   * returns information about a specific account.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(UserRole.administrator)
  @Get(':id')
  async getUserInformation(@Param('id') id: number): Promise<AccountDto | undefined> {
    return removeNullAttributes(new AccountDto(await this.accountService.findAccountByID(id)));
  }

  @CombinedRoles(UserRole.administrator)
  @Delete(':id')
  removeUser(@Param('id') id: number): string {
    // TODO implement function
    return 'Implementation needed';
  }

  /**
   * creates a new account.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(UserRole.administrator)
  @Post('')
  createUser(): string {
    // TODO implement function
    return 'Implementation needed';
  }
}
