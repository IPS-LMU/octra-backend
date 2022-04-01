import {Controller, Delete, Get, Post, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  @Get()
  listUsers(): string {
    // TODO implement function
    return 'Implementation needed';
  }

  @UseGuards(JwtAuthGuard)
  @Get('current')
  getCurrentUserInformation(): string {
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
