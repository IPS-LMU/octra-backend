import {Controller, Post, Req, UseFilters, UseGuards} from '@nestjs/common';
import {AuthService} from './auth.service';
import {Public} from '../authorization/public.decorator';
import {LocalAuthGuard} from './local-auth.guard';
import {AuthDto, AuthLoginDto} from './auth.dto';
import {ApiBody, ApiExtraModels, ApiTags} from '@nestjs/swagger';
import {AccountEntity} from '../account/entities/account.entity';
import {HttpExceptionFilter} from '../../obj/filters/http-exception.filter';

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
  @Post('login')
  @UseFilters(new HttpExceptionFilter())
  @UseGuards(LocalAuthGuard)
  login(@Req() req: { user: AccountEntity }): Promise<AuthDto> {
    return this.authService.login(req.user);
  }
}
