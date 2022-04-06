import {Controller, Delete, Get, Param, Post, Req} from '@nestjs/common';
import {Request} from 'express';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
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

  @Get(':id')
  getUserInformation(@Param('id') id: number): string {
    // TODO implement function
    return 'Implementation needed';
  }

  @Delete(':id')
  removeUser(@Param('id') id: number): string {
    // TODO implement function
    return 'Implementation needed';
  }
}
