import {applyDecorators, ClassSerializerInterceptor, SerializeOptions, UseInterceptors} from '@nestjs/common';
import {AccountRole} from '@octra/api-types';
import {Roles} from '../../../../role.decorator';

export function CombinedRoles(...roles: AccountRole[]) {
  return applyDecorators(
    Roles(...roles),
    SerializeOptions({
      groups: [...roles.map(a => `role:${a}`)]
    }),
    UseInterceptors(ClassSerializerInterceptor)
  );
}
