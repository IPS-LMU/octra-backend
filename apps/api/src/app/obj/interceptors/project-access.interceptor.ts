import {CallHandler, ExecutionContext, Injectable, NestInterceptor} from '@nestjs/common';
import {Observable} from 'rxjs';
import {ProjectService} from '../../core/project/project.service';
import {InternRequest} from '../types';
import {AccountRole} from '@octra/api-types';
import {ROLES_KEY} from '../../../../role.decorator';
import {Reflector} from '@nestjs/core';
import {checkIfProjectAccessAllowed} from '../../functions';
import {TaskEntity} from '@octra/server-side';
import {NotFoundException} from '../exceptions';

@Injectable()
export class ProjectAccessInterceptor implements NestInterceptor {
  constructor(
    private projectService: ProjectService, private reflector: Reflector
  ) {
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request: InternRequest = context.switchToHttp().getRequest();

    if (request?.params?.project_id) {
      const project = await this.projectService.getProject(request.params.project_id);
      const allowedProjectRoles = this.reflector.get<AccountRole[]>(ROLES_KEY, context.getHandler());

      if (!project) {
        throw new NotFoundException(`Can't find any project with this id.`)
      }
      if (!request?.params?.task_id) {
        checkIfProjectAccessAllowed(project, undefined, request.user, allowedProjectRoles);
      }
      request.project = project;

      let task: TaskEntity;
      if (request?.params?.task_id) {
        task = await this.projectService.getTask(request.params.project_id, request.params.task_id);

        if (!task) {
          throw new NotFoundException(`Can't find any task with this id.`)
        }

        checkIfProjectAccessAllowed(project, task, request.user, allowedProjectRoles);
        request.task = task;
      }

      checkIfProjectAccessAllowed(project, task, request.user, allowedProjectRoles)
    }

    return next.handle();
  }
}
