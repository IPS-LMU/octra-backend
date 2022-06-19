import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  Query,
  Render,
  UnauthorizedException,
  UseFilters
} from '@nestjs/common';
import {AuthService} from './auth.service';
import {Public} from '../authorization/public.decorator';
import {AuthDto, AuthLoginDto} from './auth.dto';
import {ApiBody, ApiTags} from '@nestjs/swagger';
import {HttpExceptionFilter} from '../../obj/filters/http-exception.filter';
import {InvalidCredentialsException} from '../../obj/exceptions';
import {CustomApiException} from '../../obj/decorators/api-exception.decorators';
import * as jwt from 'jsonwebtoken';
import {ConfigService} from '@nestjs/config';
import {SHA256} from 'crypto-js';
import {AccountService} from '../account';
import {AccountLoginMethod} from '@octra/api-types';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private configService: ConfigService, private accountService: AccountService) {
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

  @CustomApiException(new InvalidCredentialsException())
  @Public()
  @Post('login')
  @UseFilters(new HttpExceptionFilter())
  async login(@Body() dto: AuthLoginDto): Promise<AuthDto> {
    return this.authService.login(dto);
  }

  @Public()
  @Render('confirmShibboleth')
  @Post('confirmShibboleth')
  async confirmShibboleth(@Body() body: any, @Query('windowURL') windowURL: string) {
    let tokenBody;
    try {
      tokenBody = await this.jwtVerfiy(body.shibToken, this.configService.get('api.shibboleth.secret'));
      console.log(tokenBody);
    } catch (e) {
      throw new UnauthorizedException('Invalid Web Token. Please authenticate again.');
    }

    if (!((tokenBody.userInformation.mail && tokenBody.userInformation.mail.trim() !== '') ||
      (tokenBody.userInformation.oidEduPersonPrincipalName || tokenBody.userInformation.oidEduPersonPrincipalName.trim() !== ''))) {
      throw new UnauthorizedException('Shibboleth response does not contain eduPrincipalName or mail attributes.');
    }

    // generate UUID
    let UUID = '';
    if (tokenBody.userInformation.oidEduPersonPrincipalName && tokenBody.userInformation.oidEduPersonPrincipalName !== '') {
      UUID = tokenBody.userInformation.oidEduPersonPrincipalName;
    } else if (tokenBody.userInformation.mail && tokenBody.userInformation.mail !== '') {
      UUID = tokenBody.userInformation.mail;
    }

    if (UUID !== '') {
      // save user
      UUID = SHA256(UUID).toString();
      console.log(`UUID is ${UUID}`);
      // check if user exists
      const user = await this.accountService.findAccountByHash(UUID);

      const redirectWithToken = (id: string, roles: any[]) => {
        const tokenData = {
          id,
          accessRights: roles
        };
        const token = jwt.sign(tokenData, this.configService.get('api.secret'));

        return {
          userName: '',
          email: '',
          token: token,
          windowURL: windowURL
        };
      }

      if (user) {
        console.log(`user exists`);
        redirectWithToken(user.id, user.roles);
      } else {
        console.log(`user does not exist`);

        const userName = (tokenBody.userInformation.displayName && tokenBody.userInformation.displayName.trim() !== '')
          ? tokenBody.userInformation.displayName : body.userName;

        const email = (tokenBody.userInformation.mail && tokenBody.userInformation.mail.trim() !== '')
          ? tokenBody.userInformation.mail : body.email;

        console.log(`userName: ${userName}, email: ${email}`);
        if (userName && userName.trim() !== '' && email && email.trim() !== '') {
          // save user
          const newUser = await this.accountService.createAccount({
            name: userName,
            email,
            creationdate: new Date(),
            id: undefined,
            role: undefined,
            updatedate: new Date(),
            password: UUID
          }, AccountLoginMethod.shibboleth);

          console.log(`user created with id ${newUser.id}`);
          redirectWithToken(newUser.id, newUser.roles);
        } else {
          return {
            userName: tokenBody.userInformation.displayName,
            email: tokenBody.userInformation.mail,
            shibToken: body.shibToken,
            token: '',
            windowURL: ''
          };
        }
      }
    } else {
      throw new InternalServerErrorException('Can not generate UUID.');
    }
  }

  private async jwtVerfiy(token: string, secretOrPublicKey: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secretOrPublicKey, (err, tokenBody) => {
        if (err) {
          reject(err);
        } else {
          resolve(tokenBody);
        }
      })
    });
  }
}
