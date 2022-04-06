import {Injectable} from '@nestjs/common';
import {UsersService} from '../users';
import {JwtService} from '@nestjs/jwt';
import {User} from '../users/user';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService,
              private jwtService: JwtService) {
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      const {password, ...result} = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const payload = {username: user.username, roles: user.roles, sub: user.userId};
    return {
      access_token: this.jwtService.sign(payload)
    }
  }
}
