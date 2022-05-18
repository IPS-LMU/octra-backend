import {SetMetadata} from '@nestjs/common';
import {AccountRole} from '@octra/octra-api-types';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: AccountRole[]) => SetMetadata(ROLES_KEY, roles);
