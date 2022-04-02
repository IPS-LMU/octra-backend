import {Body, Controller, Post, Req, UseGuards} from '@nestjs/common';
import {AuthService} from './auth.service';
import {Public} from '../../public.decorator';
import {ConfigService} from '@nestjs/config';
import {UserRegisterDto} from '@octra/octra-api-types';
import {Request} from 'express';
import {LocalAuthGuard} from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private configService: ConfigService) {
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() req: Request): any {
    console.log('test authorized')
    return this.authService.login(req.user);
  }

  @Post('register')
  register(@Body() registerUserDto: UserRegisterDto): string {
    // TODO implement function
    return 'Implementation needed';
  }
}
