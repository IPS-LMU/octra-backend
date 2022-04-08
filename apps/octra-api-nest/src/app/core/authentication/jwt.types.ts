import {RoleDto} from '../account/account.dto';

export class JWTPayload {
  username: string;
  roles: RoleDto[];
  sub: number;
}
