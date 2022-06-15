import {Injectable, InternalServerErrorException} from '@nestjs/common';
import {AccountService} from '../account';
import {JwtService} from '@nestjs/jwt';
import {SHA256} from 'crypto-js';
import {ConfigService} from '@nestjs/config';
import {JWTPayload} from './jwt.types';
import {AuthDto, AuthLoginDto} from './auth.dto';
import {AccountEntity} from '@octra/server-side';

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
    try {
      if (dto.type === 'shibboleth') {
        return {openURL: this.configService.get('api.shibboleth.windowURL')};
      }

      const user = await this.validateUser(dto.username, dto.password);
      const payload: JWTPayload = {
        customSalt: this.configService.get<string>('api.jwtSalt'),
        sub: user.id
      };

      return {
        access_token: this.jwtService.sign(payload),
        account_id: user.id
      }
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(e);
    }
  }

  private getPasswordHash(password: string): string {
    let salt = this.configService.get('api.passwordSalt');
    salt = SHA256(salt).toString();
    return SHA256(password + salt).toString();
  }
}
