import {
  applyDecorators,
  ClassSerializerInterceptor,
  SerializeOptions,
  UseInterceptors,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
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
    CustomApiException(new InvalidJwtTokenException()),
    UsePipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      enableDebugMessages: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: false
    }))
  );
}

export function CombinedRolesWithoutSerialization(...roles: AccountRole[]) {
  return applyDecorators(
    Roles(...roles),
    CustomApiException(new ForbiddenResource()),
    CustomApiException(new InvalidJwtTokenException())
  );
}
