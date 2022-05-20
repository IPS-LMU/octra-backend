import {CurrentUser} from './obj/types';
import {MethodNotAllowedException} from '@nestjs/common';
import {AccountRole} from '@octra/api-types';
import {ProjectEntity, TaskEntity} from '@octra/server-side';
import {environment} from '../environments/environment';
import {dirname} from 'path';


export function isProjectAccessAllowed(project: ProjectEntity, task: TaskEntity, user: CurrentUser, allowedProjectRoles: string[]) {
  const generalRole = user.roles.find(a => a.scope === 'general');

  if (allowedProjectRoles.length > 0 && generalRole.role !== AccountRole.administrator) {
    const userProjectRole = user.roles.find(a => a.project_id?.toString() === project.id);
    // check project role
    if (userProjectRole) {
      if (userProjectRole.role !== AccountRole.projectAdministrator) {
        if (userProjectRole.role === AccountRole.user) {
          if (allowedProjectRoles.find(a => a === AccountRole.user)) {
            if (task?.worker_id && task?.worker_id !== user.userId) {
              return false;
            }
          }
        }
      }
    } else {
      // user doesn't have an user role, assume "user"
      if (allowedProjectRoles.find(a => a === AccountRole.user)) {
        if (task?.worker_id && task?.worker_id !== user.userId) {
          return false;
        }
      } else {
        return false;
      }
    }
  }
  return true;
}

export function checkIfProjectAccessAllowed(project: ProjectEntity, task: TaskEntity, user: CurrentUser, allowedProjectRoles: string[]) {
  if (!isProjectAccessAllowed(project, undefined, user, allowedProjectRoles)) {
    throw new MethodNotAllowedException(`You don't have access to this method.`);
  }
}

export function getConfigPath() {
  if (process.env['configPath']) {
    console.log('got env variable: ' + process.env['configPath']);
    return process.env['configPath'];
  } else {
    if (environment.production) {
      console.log('get dirname of execpath: ' + dirname(process.execPath));
      return dirname(process.execPath);
    } else {
      console.log('get dirname ' + __dirname);
      return __dirname;
    }
  }
}
