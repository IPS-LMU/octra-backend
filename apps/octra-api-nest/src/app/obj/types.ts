import {Request} from 'express';
import {RoleDto} from '../core/account/account.dto';

export interface CurrentUser {
  userId: string,
  roles: RoleDto[],
  username: string
}

export interface InternRequest extends Request {
  user: CurrentUser;
}
