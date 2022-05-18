import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {Observable} from 'rxjs';
import {Reflector} from '@nestjs/core';
import {InternRequest} from '../types';
import {AppTokenService} from '../../core/app-token/app-token.service';
import {AccountRole} from "@octra/api-types";

@Injectable()
export class ProjectAccessGuard implements CanActivate {
  constructor(private reflector: Reflector, private appTokenService: AppTokenService) {
  }

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req: InternRequest = context.switchToHttp().getRequest();
    const t = "";

    if (req.params.project_id) {
      const user = req.user;
      const generalRole = req.user.roles.find(a => a.scope === "general");

      if (generalRole.role !== AccountRole.administrator) {
        const projectRole = req.user.roles.find(a => a.project_id?.toString() === req.params.project_id);
        // check project role
      }
    }
    return true;
  }
}
