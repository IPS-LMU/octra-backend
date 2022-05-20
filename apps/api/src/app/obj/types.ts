import {Request} from 'express';
import {RoleDto} from '../core/account/account.dto';
import {ProjectEntity, TaskEntity} from '@octra/server-side';

export interface CurrentUser {
  userId: string,
  roles: RoleDto[],
  username: string
}

export interface InternRequest extends Request {
  user: CurrentUser;
  project: ProjectEntity;
  task: TaskEntity;
}
