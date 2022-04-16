import {Request} from 'express';
import {RoleDto} from '../core/account/account.dto';

export interface InternRequest extends Request {
  user: {
    userId: number,
    roles: RoleDto[],
    username: string
  };
}
