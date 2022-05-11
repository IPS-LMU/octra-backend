import {Injectable} from '@nestjs/common';
import {AccountService} from '../account';
import {JwtService} from '@nestjs/jwt';
import {SHA256} from 'crypto-js';
import {ConfigService} from '@nestjs/config';
import {JWTPayload} from './jwt.types';
import {AccountEntity} from '../account/entities/account.entity';
import {AuthDto} from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private usersService: AccountService,
              private jwtService: JwtService,
              private configService: ConfigService) {
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findAccountByName(username);
    if (user && user.account_person.hash === this.getPasswordHash(pass)) {
      const {...result} = user;
      return result;
    }
    return null;
  }

  async login(user: AccountEntity): Promise<AuthDto> {
    const payload: JWTPayload = {
      customSalt: this.configService.get<string>('api.jwtSalt'),
      sub: user.id
    };
    return {
      access_token: this.jwtService.sign(payload),
      account_id: user.id
    }
  }

  private getPasswordHash(password: string): string {
    let salt = this.configService.get('api.passwordSalt');
    salt = SHA256(salt).toString();
    return SHA256(password + salt).toString();
  }
}
