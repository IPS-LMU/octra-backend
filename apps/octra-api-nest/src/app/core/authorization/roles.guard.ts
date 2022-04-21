import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {AccountRole} from '@octra/octra-api-types';
import {ROLES_KEY} from '../../../../role.decorator';
import {RoleDto} from '../account/account.dto';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AccountRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const {user} = context.switchToHttp().getRequest();
    const roles: RoleDto[] = user.roles;
    return requiredRoles.some((role) => roles?.find(a => a.role === role) !== undefined);
  }
}
