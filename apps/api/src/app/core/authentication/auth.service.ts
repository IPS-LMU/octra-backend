import {HttpException, Injectable, InternalServerErrorException, UnauthorizedException} from '@nestjs/common';
import {AccountService} from '../account';
import {JwtService} from '@nestjs/jwt';
import {SHA256} from 'crypto-js';
import {ConfigService} from '@nestjs/config';
import {JWTPayload} from './jwt.types';
import {AuthDto, AuthLoginDto} from './auth.dto';
import {AccountEntity} from '@octra/server-side';
import {AccountDto} from '../account/account.dto';
import {InvalidCredentialsException} from '../../obj/exceptions';
import * as jwt from 'jsonwebtoken';
import {Response} from 'express';
import {InternRequest} from '../../obj/types';
import {AccountLoginMethod} from '@octra/api-types';

@Injectable()
export class AuthService {
  constructor(private usersService: AccountService,
              private jwtService: JwtService,
              private configService: ConfigService) {
  }

  async validateUser(username: string, pass: string): Promise<AccountEntity> {
    const user = await this.usersService.findAccountByName(username);
    if (user && user.account_person.hash === this.getPasswordHash(pass)) {
      const {...result} = user;
      return result;
    }
    return null;
  }

  async login(dto: AuthLoginDto): Promise<AuthDto> {
    if (dto.type === 'shibboleth') {
      const authDto = new AuthDto({openURL: this.configService.get('api.plugins.shibboleth.windowURL')});
      console.log('return auth dto');
      console.log(authDto);
      return authDto;
    }
    try {
      const user = await this.validateUser(dto.username, dto.password);

      if (!user) {
        throw new InvalidCredentialsException();
      }
      const payload: JWTPayload = {
        customSalt: this.configService.get<string>('api.security.keys.jwt.salt'),
        sub: user.id
      };

      return new AuthDto({
        accessToken: this.jwtService.sign(payload),
        account: new AccountDto(user)
      });
    } catch (e) {
      console.log(e);
      if (e instanceof HttpException) {
        throw e;
      }
      throw new InternalServerErrorException(e);
    }
  }

  async logout(res: Response, req: InternRequest) {
    res.clearCookie('ocb_sessiontoken');
    res.clearCookie('ocb_authenticated');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send('')
  }

  private getPasswordHash(password: string): string {
    let salt = this.configService.get('api.security.keys.password.salt');
    salt = SHA256(salt).toString();
    return SHA256(password + salt).toString();
  }

  public async checkShibbolethUser(shibToken, generalSettings: any): Promise<{
    user: AccountEntity,
    uuid: string
  }> {
    // after shibboleth authentification
    let tokenBody;
    try {
      tokenBody = await this.jwtVerfiy(shibToken, this.configService.get('api.plugins.shibboleth.secret'));
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
      return {
        user: await this.usersService.findAccountByHash(UUID),
        uuid: UUID
      };
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

  setAuthenticatedCookie(res: Response, method: AccountLoginMethod) {
    res.cookie('ocb_authenticated', method, {
      sameSite: 'strict',
      httpOnly: false,
      secure: true
    });
  }

  setSessionCookie(res: Response, token: string) {
    res.cookie('ocb_sessiontoken', token, {
      sameSite: 'strict',
      httpOnly: true,
      secure: true
    });
  }
}
