import {HttpException, Injectable, InternalServerErrorException} from '@nestjs/common';
import {AccountService} from '../account';
import {JwtService} from '@nestjs/jwt';
import {SHA256} from 'crypto-js';
import {ConfigService} from '@nestjs/config';
import {JWTPayload} from './jwt.types';
import {AuthDto, AuthLoginDto} from './auth.dto';
import {AccountEntity} from '@octra/server-side';
import {AccountDto} from '../account/account.dto';
import {InvalidCredentialsException} from '../../obj/exceptions';

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
      return new AuthDto({openURL: this.configService.get('api.shibboleth.windowURL')});
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

  private getPasswordHash(password: string): string {
    let salt = this.configService.get('api.passwordSalt');
    salt = SHA256(salt).toString();
    return SHA256(password + salt).toString();
  }
}
