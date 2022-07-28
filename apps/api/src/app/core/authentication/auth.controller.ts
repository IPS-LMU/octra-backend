import {Body, Controller, Get, Header, Post, Query, Req, Res, UseFilters} from '@nestjs/common';
import {AuthService} from './auth.service';
import {Public} from '../authorization/public.decorator';
import {AuthLoginDto} from './auth.dto';
import {ApiBody, ApiTags} from '@nestjs/swagger';
import {HttpExceptionFilter} from '../../obj/filters/http-exception.filter';
import {BadRequestException, InvalidCredentialsException} from '../../obj/exceptions';
import {CustomApiException} from '../../obj/decorators/api-exception.decorators';
import * as jwt from 'jsonwebtoken';
import {ConfigService} from '@nestjs/config';
import {AccountService} from '../account';
import {AccountFieldContext, AccountLoginMethod, AccountRole, CountryStates} from '@octra/api-types';
import {Request, Response} from 'express';
import {JWTPayload} from './jwt.types';
import {JwtService} from '@nestjs/jwt';
import {SettingsService} from '../settings/settings.service';
import {AccountCreateRequestDto} from '../account/account.dto';
import {GeneralSettingsDto} from '../settings/settings.dto';
import {I18n, I18nContext, TranslateOptions} from 'nestjs-i18n';
import {InternRequest} from '../../obj/types';
import {AccountFieldsService} from '../account/fields';
import {AccountFieldDefinitionEntity} from '@octra/server-side';
import {AppTokenService} from '../app-token/app-token.service';
import {CombinedRoles} from '../../obj/decorators/combine.decorators';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private configService: ConfigService,
              private accountService: AccountService, private jwtService: JwtService,
              private appTokenService: AppTokenService,
              private settingsService: SettingsService,
              private accountFieldService: AccountFieldsService) {
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
  async login(@Body() dto: AuthLoginDto, @Res() res: Response): Promise<void> {
    console.log('login');
    const result = await this.authService.login(dto);
    if (result.accessToken) {
      this.authService.setSessionCookie(res, result.accessToken);
      this.authService.setAuthenticatedCookie(res, AccountLoginMethod.local);
    }
    res.status(201).send(result);
  }

  @Post('logout')
  @CombinedRoles(AccountRole.administrator, AccountRole.user)
  @UseFilters(new HttpExceptionFilter())
  async logout(@Res() res: Response, @Req() req: InternRequest): Promise<void> {
    return this.authService.logout(res, req);
  }

  @Public()
  @Header('content-type', 'text/html')
  @Get('complete-profile')
  async showCompleteProfile(@Body() body: any,
                            @Query('windowURL') windowURL: string,
                            @Query('cid') cid: string,
                            @Query('r') redirectTo: string,
                            @I18n() i18n: I18nContext,
                            @Res() res: Response, @Req() req: InternRequest) {
    const page = this.getPageMeta(req, i18n);
    const accountFields = await this.accountFieldService.listFieldDefinitions({
      where: {
        context: AccountFieldContext.account
      },
      order: {
        sort_order: {
          direction: 'asc'
        },
        name: {
          direction: 'asc'
        }
      }
    });

    const appToken = await this.appTokenService.getOne('1');

    res.render('complete-profile', {
      cid,
      token: req.cookies['ocb_sessiontoken'],
      windowURL: '',
      baseURL: this.configService.get('api.baseURL'),
      redirectTo: redirectTo ?? '',
      listOfCountries: CountryStates,
      appToken: appToken.key,
      t: (key: string, args: TranslateOptions) => i18n.t(key, args),
      page,
      accountFields
    });
  }

  @Public()
  @Header('content-type', 'text/html')
  @Get('confirm-shibboleth')
  async confirmShibboleth(@Body() body: any, @Query('windowURL') windowURL: string,
                          @Query('cid') cid: string, @Query('r') redirectTo: string,
                          @I18n() i18n: I18nContext,
                          @Res() res: Response, @Req() req: InternRequest) {
    const generalSettings = await this.settingsService.getGeneralSettings();
    const {dataPolicyURL, termsConditionsURL} = await this.getURLS(generalSettings, req);
    const page = this.getPageMeta(req, i18n);
    let query = this.getQueryString(req.query, ['lang']);
    const sessionToken = req.cookies['ocb_sessiontoken'];
    const shibToken = req.cookies['ocb_shibtoken'];

    if (shibToken) {
      const userObj = await this.authService.checkShibbolethUser(shibToken, generalSettings);
      if (!userObj.user) {
        // show registration form
        res.render('confirm-shibboleth', {
          userName: '',
          email: '',
          cid,
          token: '',
          windowURL: '',
          baseURL: this.configService.get('api.baseURL'),
          dataPolicyURL,
          termsConditionsURL,
          redirectTo: redirectTo ?? '',
          listOfCountries: CountryStates,
          query,
          t: (key: string, args: TranslateOptions) => i18n.t(key, args),
          page
        });
      } else {
        await this.redirectWithToken(userObj.user, false, res, cid, dataPolicyURL, termsConditionsURL, windowURL, redirectTo, i18n, page, query);
      }
    } else {
      res.render('confirm-shibboleth', {
        userName: '',
        email: '',
        cid,
        token: sessionToken ?? '',
        windowURL: windowURL ?? '',
        baseURL: this.configService.get('api.baseURL'),
        dataPolicyURL,
        termsConditionsURL,
        redirectTo: redirectTo ?? '',
        listOfCountries: CountryStates,
        query,
        t: (key: string, args: TranslateOptions) => i18n.t(key, args),
        page
      });
    }
  }

  @Public()
  @Header('content-type', 'text/html')
  @Post('confirm-shibboleth')
  async createAccountAfterShibbolethAuthentication(@Body() body: any, @Query('windowURL') windowURL: string,
                                                   @Query('cid') cid: string, @Query('r') redirectTo: string,
                                                   @I18n() i18n: I18nContext,
                                                   @Res() res: Response, @Req() req: InternRequest) {

    const generalSettings = await this.settingsService.getGeneralSettings();
    const {dataPolicyURL, termsConditionsURL} = await this.getURLS(generalSettings, req);
    const page = this.getPageMeta(req, i18n);
    let query = this.getQueryString(req.query, ['lang']);
    const shibToken = req.cookies['ocb_shibtoken'];

    if (!shibToken) {
      throw new BadRequestException(`Registration failed. Missing Shibboleth authentication.`);
    } else {
      // after shibboleth authentification
      const userObj = await this.authService.checkShibbolethUser(shibToken, generalSettings);

      // check if user exists

      if (userObj.user) {
        await this.redirectWithToken(userObj.user, false, res, cid, dataPolicyURL, termsConditionsURL, windowURL, redirectTo, i18n, page, query);
      } else {
        if (body.dataPolicyAccepted === 'yes' && body.termsAccepted === 'yes' && body.username?.trim() !== '' && body.email?.trim() !== '') {
          // user wants to create a new account
          // save user
          const createUser: AccountCreateRequestDto = {
            username: body.username,
            email: body.email,
            first_name: body.first_name,
            last_name: body.last_name,
            gender: body.gender,
            country: body.country,
            organization: body.organization,
            state: body.state,
            id: undefined,
            role: AccountRole.user,
            creationdate: new Date(),
            updatedate: new Date(),
            password: userObj.uuid
          };
          const newUser = await this.accountService.createAccount(createUser, AccountLoginMethod.shibboleth);
          await this.redirectWithToken(newUser, true, res, cid, dataPolicyURL, termsConditionsURL, windowURL, redirectTo, i18n, page, query);
        } else {
          // ask for account creation
          res.render('confirm-shibboleth', {
            cid,
            token: '',
            baseURL: this.configService.get('api.baseURL'),
            windowURL,
            redirectTo: redirectTo ?? '',
            dataPolicyURL,
            termsConditionsURL,
            listOfCountries: CountryStates,
            t: (key: string, args: TranslateOptions) => i18n.t(key, args),
            page,
            query
          });
        }
      }
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

  private getPageMeta(req: InternRequest, i18n: I18nContext) {
    return {
      lang: i18n.lang
    }
  }

  private redirectWithToken = async (user: any, isNew: boolean, res, cid, dataPolicyURL, termsConditionsURL, windowURL, redirectTo, i18n, page, query) => {
    const payload: JWTPayload = {
      customSalt: this.configService.get<string>('api.security.keys.jwt.salt'),
      sub: user.id
    };
    const token = this.jwtService.sign(payload);

    // set ocb_sessiontoken cookie
    this.authService.setSessionCookie(res, token);
    this.authService.setAuthenticatedCookie(res, AccountLoginMethod.shibboleth);

    //remove shibtoken because we don't need it anymore
    res.clearCookie('ocb_shibtoken');

    if (isNew) {
      res.redirect(this.configService.get('api.baseURL') + 'auth/complete-profile' + (query ?? ''));
    } else {
      res.redirect(redirectTo);
    }
  }

  private getQueryString(query, ignoredKeys = []) {
    let result = '';
    let i = 0;
    const keys = Object.keys(query).filter((a) => !ignoredKeys.includes(a))
    for (const key of keys) {
      if (i === 0) {
        result += `?${key}=${query[key]}`;
      } else {
        result += `&${key}=${query[key]}`;
      }
      i++;
    }
    return result;
  }

  private prepareAccountFields(accountFields: AccountFieldDefinitionEntity[], language: string) {
    let result: any = {
      ...accountFields
    };

    for (const accountField of accountFields) {
      let translation: any = {};
      for (const attr of Object.keys(accountField.definition)) {
        if (attr === 'translations') {
          for (const langObj of accountField.definition[attr]) {
            translation = {
              ...translation,

            }
          }
        }
      }
    }

    return result;
  }
}
