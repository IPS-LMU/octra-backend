import {Controller, Post, Req, UseFilters, UseGuards} from '@nestjs/common';
import {AuthService} from './auth.service';
import {Public} from '../authorization/public.decorator';
import {LocalAuthGuard} from './local-auth.guard';
import {AuthDto} from './auth.dto';
import {ApiBody, ApiTags} from '@nestjs/swagger';
import {HttpExceptionFilter} from '../../obj/filters/http-exception.filter';
import {AccountEntity} from '@octra/server-side';

@ApiTags('Authentication')
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
  @Post('login')
  @UseFilters(new HttpExceptionFilter())
  @UseGuards(LocalAuthGuard)
  login(@Req() req: { user: AccountEntity }): Promise<AuthDto> {
    return this.authService.login(req.user);
  }
}
