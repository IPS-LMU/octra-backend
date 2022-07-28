import {ExtractJwt, Strategy} from 'passport-jwt';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable} from '@nestjs/common';
import {JWTPayload} from './jwt.types';
import {AccountService} from '../account';
import {CurrentUser} from '../../obj/types';
import {AccountRoleScope} from '@octra/api-types';
import {InvalidJwtTokenException} from '../../obj/exceptions';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private accountService: AccountService, private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors(
        [
          (req) => {
            var token = null;
            if (req && req.cookies) {
              token = req.cookies['ocb_sessiontoken'];
            }
            return token;
          },
          ExtractJwt.fromAuthHeaderAsBearerToken()
        ]
      ),
      ignoreExpiration: false,
      secretOrKey: configService.get('api.security.keys.jwt.secret')
    });
  }

  async validate(payload: JWTPayload): Promise<CurrentUser> {
    const account = await this.accountService.getAccount(payload.sub);

    if (!account) {
      throw new InvalidJwtTokenException();
    }
    return {
      userId: payload.sub.toString(),
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
          valid_startdate: a.valid_startdate?.toISOString(),
          valid_enddate: a.valid_enddate?.toISOString(),
        }))
      ],
      username: account?.account_person?.username
    };
  }
}
