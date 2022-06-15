import {Controller, Post, Req, UseFilters, UseGuards} from '@nestjs/common';
import {AuthService} from './auth.service';
import {Public} from '../authorization/public.decorator';
import {LocalAuthGuard} from './local-auth.guard';
import {AuthDto} from './auth.dto';
import {ApiBody, ApiResponse, ApiTags} from '@nestjs/swagger';
import {HttpExceptionFilter} from '../../obj/filters/http-exception.filter';
import {AccountEntity} from '@octra/server-side';
import {InvalidCredentialsException} from '../../obj/exceptions';
import {CustomApiException} from '../../obj/decorators/api-exception.decorators';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
  }

  /**
   * authenticates a given user. Two authentication methods are supported: <code>shibboleth</code> and <code>local</code>:
   *
   * <ul>
   *   <li>shibboleth: the user authenticates via Shibboleth (the shibboleth authentication must be supported by the server)</li>
   *   <li>local: the user authenticates using an local account (via credentials)</li>
   * </ul>
   *
   */
  @ApiBody({
    examples: {
      'Local Login': {
        description: 'Authenticate using credentials',
        value: {
          type: 'local',
          username: 'myUserName',
          password: 'Test123'
        }
      },
      'Shibboleth': {
        description: 'Authenticate via shibboleth',
        value: {
          type: 'shibboleth',
          email: 'my-email@example.com'
        }
      }
    },
    schema: {
      type: 'object',
      oneOf: [
        {
          required: ['type', 'username'],
          properties: {
            type: {
              type: 'string',
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
  @ApiResponse({
    status: 201, description: 'authentication successful', schema: {
      example: {
        access_token: '32746729834nu329wzhtfwh8zqr87wefq',
        account_id: '1'
      }
    }
  })
  @CustomApiException(new InvalidCredentialsException())
  @Public()
  @Post('login')
  @UseFilters(new HttpExceptionFilter())
  @UseGuards(LocalAuthGuard)
  login(@Req() req: { user: AccountEntity }): Promise<AuthDto> {
    return this.authService.login(req.user);
  }
}
