import {Body, Controller, Post} from '@nestjs/common';
import {UserLoginDto} from '../users/dto';
import {AuthService} from './auth.service';
import {Public} from '../public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
  }

  @Public()
  @Post('login')
  login(@Body() loginUserDto: UserLoginDto): any {
    console.log('test authorized')
    return this.authService.login(loginUserDto);
  }

  @Post('register')
  register(): string {
    // TODO implement function
    return 'Implementation needed';
  }
}
