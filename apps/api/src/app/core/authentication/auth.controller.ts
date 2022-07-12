import {
  Body,
  Controller,
  Get,
  Header,
  InternalServerErrorException,
  Post,
  Query,
  Req,
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
import {Request, Response} from 'express';
import {JWTPayload} from './jwt.types';
import {JwtService} from '@nestjs/jwt';
import {SettingsService} from '../settings/settings.service';
import {AccountCreateRequestDto} from '../account/account.dto';
import {GeneralSettingsDto} from '../settings/settings.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private configService: ConfigService, private accountService: AccountService, private jwtService: JwtService,
              private settingsService: SettingsService) {
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

  @Public()
  @CustomApiException(new InvalidCredentialsException())
  @Post('login')
  @UseFilters(new HttpExceptionFilter())
  async login(@Body() dto: AuthLoginDto): Promise<AuthDto> {
    console.log('login');
    return this.authService.login(dto);
  }

  @Public()
  @Header('content-type', 'text/html')
  @Get('confirmShibboleth')
  async introduceShibboleth(@Body() body: any, @Query('windowURL') windowURL: string, @Query('r') redirectTo: string, @Res() res: Response, @Req() req: Request) {
    const generalSettings = await this.settingsService.getGeneralSettings();
    const {dataPolicyURL, termsConditionsURL} = await this.getURLS(generalSettings, req);

    res.render('confirmShibboleth', {
      userName: 'displayName',
      email: 'someEmail',
      shibToken: 'shib token',
      cid: 435345,
      token: '',
      windowURL: '',
      baseURL: this.configService.get('api.baseURL'),
      dataPolicyURL,
      termsConditionsURL,
      redirectTo: redirectTo ?? ''
    });
  }

  @Public()
  @Header('content-type', 'text/html')
  @Post('confirmShibboleth')
  async confirmShibboleth(@Body() body: any, @Query('windowURL') windowURL: string, @Query('cid') cid: string, @Query('r') redirectTo: string, @Res() res: Response, @Req() req: Request) {
    let tokenBody;
    const generalSettings = await this.settingsService.getGeneralSettings();
    const {dataPolicyURL, termsConditionsURL} = await this.getURLS(generalSettings, req);

    try {
      tokenBody = await this.jwtVerfiy(body.shibToken, this.configService.get('api.plugins.shibboleth.secret'));
    } catch (e) {
      throw new UnauthorizedException('Invalid Web Token. Please authenticate again.');
    }

    if (!((tokenBody.userInformation.mail && tokenBody.userInformation.mail.trim() !== '') ||
      (tokenBody.userInformation.oidEduPersonPrincipalName || tokenBody.userInformation.oidEduPersonPrincipalName.trim() !== ''))) {
      throw new UnauthorizedException(`You can\'t authenticate with the server because of missing parameters. Please contact : <a href="mailto:${generalSettings?.mail_support_address}">${generalSettings?.mail_support_address}</a>`);
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
      UUID = SHA256(UUID + this.configService.get('api.plugins.shibboleth.uuidSalt')).toString();
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
          baseURL: this.configService.get('api.baseURL'),
          dataPolicyURL,
          termsConditionsURL,
          redirectTo: redirectTo ?? '',
          windowURL
        });
      }

      const user = await this.accountService.findAccountByHash(UUID);

      if (user) {
        redirectWithToken(user);
      } else {
        if (body.dataPolicyAccepted === 'yes' && body.termsAccepted === 'yes' && body.username?.trim() !== '' && body.email?.trim() !== '' && body.shibToken?.trim() !== '') {
          // user wants to create a new account
          // save user
          const createUser: AccountCreateRequestDto = {
            name: body.username,
            email: body.email,
            id: undefined,
            role: AccountRole.user,
            creationdate: new Date(),
            updatedate: new Date(),
            password: UUID
          };
          const newUser = await this.accountService.createAccount(createUser, AccountLoginMethod.shibboleth);
          redirectWithToken(newUser);
        } else {
          // ask for account creation

          res.render('confirmShibboleth', {
            shibToken: body.shibToken,
            cid,
            token: '',
            baseURL: this.configService.get('api.baseURL'),
            windowURL: '',
            redirectTo: redirectTo ?? '',
            dataPolicyURL,
            termsConditionsURL,
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

  private async getURLS(generalSettings: GeneralSettingsDto, req: Request) {
    const languages = req.header('ACCEPT-LANGUAGE') || 'en-US';
    const language = languages.split(';')[0].split(',')[0];
    const dataPolicyURLObject = generalSettings.data_policy_urls && generalSettings.data_policy_urls.length > 0 ? generalSettings.data_policy_urls.find(a => a.language.indexOf(language) > -1) : undefined;
    const dataPolicyURL = dataPolicyURLObject ?? (generalSettings.data_policy_urls && generalSettings.data_policy_urls.length > 0) ? generalSettings.data_policy_urls[0].url : '';
    const termsConditionsURLObject = generalSettings.terms_conditions_urls && generalSettings.terms_conditions_urls.length > 0 ? generalSettings.terms_conditions_urls.find(a => a.language.indexOf(language) > -1) : undefined;
    const termsConditionsURL = termsConditionsURLObject ?? (generalSettings.terms_conditions_urls && generalSettings.terms_conditions_urls.length > 0) ? generalSettings.terms_conditions_urls[0].url : '';

    return {
      dataPolicyURL, termsConditionsURL
    };
  }
}
