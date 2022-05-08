import {Request} from 'express';
import {RoleDto} from '../core/account/account.dto';

export interface InternRequest extends Request {
  user: {
    userId: string,
    roles: RoleDto[],
    username: string
  };
}
