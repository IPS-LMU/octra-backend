import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Query,
  Render,
  Res,
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
import {AccountLoginMethod, AccountRole} from '@octra/api-types';
import {Response} from 'express';
import {JWTPayload} from './jwt.types';
import {JwtService} from '@nestjs/jwt';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private configService: ConfigService, private accountService: AccountService, private jwtService: JwtService) {
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
          type: 'shibboleth'
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
              enum: ['local']
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
              enum: ['local']
            },
            email: {
              type: 'string'
            },
            password: {
              type: 'string'
            }
          }
        },
        {
          required: ['type'],
          properties: {
            type: {
              enum: ['shibboleth']
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
  @Get('confirmShibboleth')
  async introduceShibboleth(@Body() body: any, @Query('windowURL') windowURL: string, @Res() res: Response) {
    res.redirect(this.configService.get('api.shibboleth.windowURL'));
  }

  @Public()
  @Render('confirmShibboleth')
  @Post('confirmShibboleth')
  async confirmShibboleth(@Body() body: any, @Query('windowURL') windowURL: string, @Query('cid') cid: string, @Res() res: Response) {
    let tokenBody;
    try {
      tokenBody = await this.jwtVerfiy(body.shibToken, this.configService.get('api.plugins.shibboleth.secret'));
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
      // hash uuid of user
      UUID = SHA256(UUID).toString();
      // check if user exists
      const redirectWithToken = (user: any) => {
        const payload: JWTPayload = {
          customSalt: this.configService.get<string>('api.security.keys.jwt.salt'),
          sub: user.id
        };
        res.render('confirmShibboleth', {
          userName: '',
          email: '',
          cid,
          token: this.jwtService.sign(payload),
          windowURL
        });
      }

      const user = await this.accountService.findAccountByHash(UUID);

      if (user) {
        redirectWithToken(user);
      } else {

        const userName = (tokenBody.userInformation.displayName && tokenBody.userInformation.displayName.trim() !== '')
          ? tokenBody.userInformation.displayName : body.userName;

        const email = (tokenBody.userInformation.mail && tokenBody.userInformation.mail.trim() !== '')
          ? tokenBody.userInformation.mail : body.email;
        if (userName && userName.trim() !== '' && email && email.trim() !== '') {
          // save user
          const newUser = await this.accountService.createAccount({
            name: userName,
            email,
            creationdate: new Date(),
            id: undefined,
            role: AccountRole.user,
            updatedate: new Date(),
            password: UUID
          }, AccountLoginMethod.shibboleth);
          redirectWithToken(newUser);
        } else {

          res.render('confirmShibboleth', {
            userName: tokenBody.userInformation.displayName,
            email: tokenBody.userInformation.mail,
            shibToken: body.shibToken,
            cid,
            token: '',
            windowURL: ''
          });
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
