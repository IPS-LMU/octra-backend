import {Controller, Delete, Get, Post, Req} from '@nestjs/common';
import {Request} from 'express';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
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

  @Post(':id/roles')
  assignUserRoles(): string {
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

  @Get(':id')
  getUserInformation(): string {
    // TODO implement function
    return 'Implementation needed';
    1
  }

  @Delete(':id')
  removeUser(): string {
    // TODO implement function
    return 'Implementation needed';
  }
}
