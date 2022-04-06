import {UserRole} from '@octra/octra-api-types';

export class User {
  username: string;
  userId: number;
  roles: UserRole
}
