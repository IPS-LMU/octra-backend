import {Injectable} from '@nestjs/common';
import {AccountService} from '../account';
import {JwtService} from '@nestjs/jwt';
import {SHA256} from 'crypto-js';
import {ConfigService} from '@nestjs/config';
import {JWTPayload} from './jwt.types';
import {Account} from '../account/entities/account.entity';
import {RoleDto} from '../account/account.dto';

@Injectable()
export class AuthService {
  constructor(private usersService: AccountService,
              private jwtService: JwtService,
              private configService: ConfigService) {
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.account_person.hash === this.getPasswordHash(pass)) {
      const {...result} = user;
      return result;
    }
    return null;
  }

  async login(user: Account) {
    const payload: JWTPayload = {
      username: user.account_person.username,
      roles: [
        ...(user.roles.map(a => ({
          role: a.role.label,
          scope: a.role.scope,
          valid_startdate: a.valid_startdate,
          valid_enddate: a.valid_enddate,
          project_id: a.project_id,
          project_name: '' // TODO add project name
        } as RoleDto)))
      ],
      sub: user.id
    };
    return {
      access_token: this.jwtService.sign(payload)
    }
  }

  private getPasswordHash(password: string): string {
    let salt = this.configService.get('api.passwordSalt');
    salt = SHA256(salt).toString();
    return SHA256(password + salt).toString();
  }
}
