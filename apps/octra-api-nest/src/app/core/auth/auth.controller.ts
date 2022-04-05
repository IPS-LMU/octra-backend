import {Body, Controller, Post, Req, UseGuards} from '@nestjs/common';
import {AuthService} from './auth.service';
import {Public} from '../../public.decorator';
import {ConfigService} from '@nestjs/config';
import {LocalAuthGuard} from './local-auth.guard';
import {AuthLoginDto, AuthRegisterDto} from './auth.dto';
import {ApiBody, ApiExtraModels, ApiTags} from '@nestjs/swagger';

@ApiTags('Authentication')
@ApiExtraModels(AuthLoginDto)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private configService: ConfigService) {
  }

  @ApiBody({
    schema: {
      type: 'object',
      oneOf: [
        {
          required: ['type', 'username'],
          properties: {
            type: {
              enum: ['local', 'shibboleth']
            },
            username: {
              type: 'string'
            },
            password: {
              type: 'string'
            }
          }
        },
        {
          required: ['type', 'email'],
          properties: {
            type: {
              enum: ['local', 'shibboleth']
            },
            email: {
              type: 'string'
            },
            password: {
              type: 'string'
            }
          }
        }
      ]
    }
  })
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() req: { user: AuthLoginDto }): any {
    return this.authService.login(req.user);
  }

  @Public()
  @Post('register')
  register(@Body() registerUserDto: AuthRegisterDto): string {
    // TODO implement function
    return 'Implementation needed';
  }
}
