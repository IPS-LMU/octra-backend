import {Controller, Delete, Get, Post} from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()
  listUsers(): string {
    // TODO implement function
    return 'Implementation needed';
  }

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
  }

  @Post('login')
  loginUser(): string {
    // TODO implement function
    return 'Implementation needed';
  }

  @Post('register')
  registerUser(): string {
    // TODO implement function
    return 'Implementation needed';
  }

  @Delete(':id')
  removeUser(): string {
    // TODO implement function
    return 'Implementation needed';
  }
}
