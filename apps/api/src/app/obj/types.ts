import {Request} from 'express';
import {RoleDto} from '../core/account/account.dto';
import {ProjectEntity} from "../core/project/project.entity";
import {TaskEntity} from "../core/project/task.entity";

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
