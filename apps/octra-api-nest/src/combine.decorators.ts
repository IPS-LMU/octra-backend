import {applyDecorators, ClassSerializerInterceptor, SerializeOptions, UseInterceptors} from '@nestjs/common';
import {UserRole} from '@octra/octra-api-types';
import {Roles} from '../role.decorator';

export function CombinedRoles(...roles: UserRole[]) {
  return applyDecorators(
    Roles(...roles),
    SerializeOptions({
      groups: [...roles.map(a => `role:${a}`)]
    }),
    UseInterceptors(ClassSerializerInterceptor)
  );
}
