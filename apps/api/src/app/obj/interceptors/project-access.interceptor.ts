import {CallHandler, ExecutionContext, Injectable, NestInterceptor} from '@nestjs/common';
import {Observable} from 'rxjs';
import {ProjectService} from '../../core/project/project.service';
import {InternRequest} from '../types';
import {AccountRole} from '@octra/api-types';
import {ROLES_KEY} from '../../../../role.decorator';
import {Reflector} from '@nestjs/core';
import {TasksService} from '../../core/project/tasks';
import {checkIfProjectAccessAllowed} from '../../functions';
import {TaskEntity} from '@octra/server-side';

@Injectable()
export class ProjectAccessInterceptor implements NestInterceptor {
  constructor(
    private projectService: ProjectService, private reflector: Reflector,
    private taskService: TasksService) {
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request: InternRequest = context.switchToHttp().getRequest();

    if (request?.params?.project_id) {
      const project = await this.projectService.getProject(request.params.project_id);
      request.project = project;
      const allowedProjectRoles = this.reflector.get<AccountRole[]>(ROLES_KEY, context.getHandler());
      let task: TaskEntity;
      if (request?.params?.task_id) {
        task = await this.taskService.getTask(request.params.project_id, request.params.task_id);
        request.task = task;
      }

      checkIfProjectAccessAllowed(project, task, request.user, allowedProjectRoles)
    }

    return next.handle();
  }
}
