import {StandardWithTimeDto} from '../standard.dto';
import {IsNotEmpty} from 'class-validator';
import {UserRole, UserRoleScope} from '@octra/db';
import {Account} from './entities/account.entity';
import {Transform, Type} from 'class-transformer';
import {AccountRoleProject, Role} from './entities/account-role-project.entity';
import {removeProperties} from '../../functions';
import {OmitType, PartialType} from '@nestjs/swagger';

export class RoleDto {
  @IsNotEmpty()
  role: UserRole;
  @IsNotEmpty()
  scope: UserRoleScope;
  project_id?: number;
  project_name?: string;
  valid_startdate?: string;
  valid_enddate?: string;

  constructor(partial: Partial<AccountRoleProject>) {
    let newObj: RoleDto = partial as any;

    newObj = {
      ...newObj,
      role: partial.role.label,
      scope: partial.role.scope
    }

    newObj = removeProperties(newObj, ['id', 'role_id', 'account_id']);
    Object.assign(this, newObj);
  }
}

export class AssignUserRoleDto extends PartialType(
  OmitType(RoleDto, ['project_id', 'project_name', 'scope'] as const)
) {
  @IsNotEmpty()
  role: UserRole;

  constructor(partial: Partial<AccountRoleProject>) {
    super();
    let newObj: RoleDto = partial as any;

    newObj = {
      ...newObj,
      role: partial.role.label,
      scope: partial.role.scope
    }

    newObj = removeProperties(newObj, ['id', 'role_id', 'account_id', 'project_id', 'project_name', 'scope']);
    Object.assign(this, newObj);
  }
}

export class AssignRoleProjectDto {
  project_id: number;
  @Type(() => RoleDto)
  roles: AssignUserRoleDto[];

  constructor(partial: Partial<AssignRoleProjectDto>) {
    Object.assign(this, partial);
  }
}

export class AssignRoleDto {
  general?: UserRole;
  projects?: AssignRoleProjectDto[];

  constructor(partial: Partial<AssignRoleDto>) {
    Object.assign(this, partial);
  }
}

export class AccountDto extends StandardWithTimeDto {
  @IsNotEmpty()
  username: string;
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  loginmethod: string;
  @IsNotEmpty()
  active: boolean;
  training?: string;
  comment?: string;

  @IsNotEmpty()
  @Transform(({value}) => value.label)
  generalRole: Role;
  @Type(() => AssignUserRoleDto)
  projectRoles: AssignUserRoleDto[];
  last_login?: string;
  registrations?: boolean;

  constructor(partial: Partial<Account>) {
    super();
    let newObj: AccountDto = partial as any;

    newObj = {
      ...newObj,
      ...removeProperties(partial.account_person, ['id']),
      projectRoles: partial.roles.map(a => removeProperties(new RoleDto(a), ['scope', 'id']))
    }
    // add transformation if account person doesnt exist
    newObj = removeProperties(newObj, ['account_person', 'role_id', 'roles']);

    Object.assign(this, newObj);
  }
}

export class ChangePasswordDto {
  @IsNotEmpty()
  oldPassword: string;
  @IsNotEmpty()
  newPassword: string;
}

export class ExistsWithHashDto {
  @IsNotEmpty()
  hash: string;
}
