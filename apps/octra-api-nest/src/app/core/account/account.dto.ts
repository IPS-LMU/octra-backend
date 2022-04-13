import {StandardWithTimeDto} from '../standard.dto';
import {IsNotEmpty} from 'class-validator';
import {UserRole, UserRoleScope} from '@octra/db';
import {Account} from './entities/account.entity';

export class RoleDto {
  @IsNotEmpty()
  role: UserRole;
  @IsNotEmpty()
  scope: UserRoleScope;
  project_id?: number;
  project_name?: string;
  valid_startdate?: string;
  valid_enddate?: string;
}

export class AccountDto extends StandardWithTimeDto {
  username: string;
  email: string;
  loginmethod: string;
  @IsNotEmpty()
  active: boolean;
  training: string;
  comment: string;
  roles: RoleDto[];
  last_login?: string;
  registrations?: boolean;

  constructor(partial: Partial<Account>) {
    super();
    Object.assign(this, partial);
  }
}
