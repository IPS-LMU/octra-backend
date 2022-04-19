import {Body, Controller, Post, Req, UseGuards} from '@nestjs/common';
import {AuthService} from './auth.service';
import {Public} from '../authorization/public.decorator';
import {LocalAuthGuard} from './local-auth.guard';
import {AuthLoginDto, AuthRegisterDto} from './auth.dto';
import {ApiBody, ApiExtraModels, ApiTags} from '@nestjs/swagger';
import {AccountEntity} from '../account/entities/account.entity';

@ApiTags('Authentication')
@ApiExtraModels(AuthLoginDto)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
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
  login(@Req() req: { user: AccountEntity }): any {
    return this.authService.login(req.user);
  }

  @Public()
  @Post('register')
  register(@Body() registerUserDto: AuthRegisterDto): string {
    // TODO implement function
    return 'Implementation needed';
  }
}
