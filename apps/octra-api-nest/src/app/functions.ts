import {ProjectEntity} from './core/project/project.entity';
import {TaskEntity} from './core/project/task.entity';
import {CurrentUser} from './obj/types';
import {AccountRole} from '@octra/octra-api-types';
import {MethodNotAllowedException} from '@nestjs/common';

export function removeNullAttributes<T>(obj: T): T {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      obj[i] = removeNullAttributes(obj[i]);
    }
  } else {
    for (const col in obj) {
      if (obj.hasOwnProperty(col)) {
        if (obj[col] === null || obj[col] === undefined || obj[col].toString() === 'NaN') {
          delete obj[col];
        } else if (typeof obj[col] === 'object') {
          obj[col] = removeNullAttributes([obj[col]])[0];
        }
      }
    }
  }
  return obj;
}

export function removeProperties(obj: any, properties: string[]) {
  if (obj) {
    const keys = Object.keys(obj);
    for (const property of properties) {
      if (keys.find(a => a === property)) {
        delete obj[property];
      }
    }
  }
  return obj;
}

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
