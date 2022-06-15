import {applyDecorators, ClassSerializerInterceptor, SerializeOptions, UseInterceptors} from '@nestjs/common';
import {AccountRole} from '@octra/api-types';
import {Roles} from '../../../../role.decorator';
import {CustomApiException} from './api-exception.decorators';
import {ForbiddenResource, InvalidJwtTokenException} from '../exceptions';

export function CombinedRoles(...roles: AccountRole[]) {
  return applyDecorators(
    Roles(...roles),
    SerializeOptions({
      groups: [...roles]
    }),
    UseInterceptors(ClassSerializerInterceptor),
    CustomApiException(new ForbiddenResource()),
    CustomApiException(new InvalidJwtTokenException())
  );
}
