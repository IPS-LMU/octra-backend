import {ExtractJwt, Strategy} from 'passport-jwt';
import {PassportStrategy} from '@nestjs/passport';
import {ForbiddenException, Injectable} from '@nestjs/common';
import {jwtConstants} from './auth.constants';
import {JWTPayload} from './jwt.types';
import {AccountService} from '../account';
import {CurrentUser} from '../../obj/types';
import {AccountRoleScope} from '@octra/api-types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private accountService: AccountService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret
    });
  }

  async validate(payload: JWTPayload): Promise<CurrentUser> {
    const account = await this.accountService.getAccount(payload.sub);

    if (!account) {
      throw new ForbiddenException(`Account not found.`);
    }
    return {
      userId: payload.sub,
      roles: [
        {
          scope: AccountRoleScope.general,
          role: account.generalRole.label
        },
        ...account.roles?.map(a => ({
          scope: a.role.scope,
          role: a.role.label,
          project_id: a.project_id,
          project_name: a.project?.name,
          valid_startdate: a.valid_startdate,
          valid_enddate: a.valid_enddate
        }))
      ],
      username: account?.account_person?.username
    };
  }
}
