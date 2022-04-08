import {Controller, Delete, Get, Param, Post, Req} from '@nestjs/common';
import {Request} from 'express';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {Roles} from '../../../../role.decorator';
import {UserRole} from '@octra/octra-api-types';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('account')
export class AccountController {
  @Roles(UserRole.administrator)
  @Get()
  listUsers(@Req() req: Request): string {
    // TODO implement function
    return 'Implementation needed';
  }

  @Get('current')
  getCurrentUserInformation(@Req() req: Request): string {
    // TODO implement function
    return 'Implementation needed';
  }

  @Roles(UserRole.administrator)
  @Post(':id/roles')
  assignUserRoles(@Param('id') id: number): string {
    // TODO implement function
    return 'Implementation needed';
  }

  @Post('password')
  changeMyPassword(): string {
    // TODO implement function
    return 'Implementation needed';
  }

  @Get('hash')
  existsWithHash(): string {
    // TODO implement function
    return 'Implementation needed';
  }

  @Roles(UserRole.administrator)
  @Get(':id')
  getUserInformation(@Param('id') id: number): string {
    // TODO implement function
    return 'Implementation needed';
  }

  @Roles(UserRole.administrator)
  @Delete(':id')
  removeUser(@Param('id') id: number): string {
    // TODO implement function
    return 'Implementation needed';
  }
}
