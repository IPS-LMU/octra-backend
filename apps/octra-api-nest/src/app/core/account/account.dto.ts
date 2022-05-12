import {StandardWithTimeDto} from '../standard.dto';
import {IsEnum, IsNotEmpty} from 'class-validator';
import {AccountEntity} from './entities/account.entity';
import {Transform, Type} from 'class-transformer';
import {AccountRoleProjectEntity, RoleEntity} from './entities/account-role-project.entity';
import {removeProperties} from '../../functions';
import {OmitType, PartialType} from '@nestjs/swagger';
import {AccountRole, AccountRoleScope} from '@octra/octra-api-types';

export class RoleDto {
  @IsNotEmpty()
  role: AccountRole;
  @IsNotEmpty()
  scope: AccountRoleScope;
  project_id?: string;
  project_name?: string;
  valid_startdate?: string;
  valid_enddate?: string;

  constructor(partial: Partial<AccountRoleProjectEntity>) {
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

export class AssignAccountRoleDto extends PartialType(
  OmitType(RoleDto, ['project_id', 'project_name', 'scope'] as const)
) {
  @IsNotEmpty()
  role: AccountRole;

  constructor(partial: Partial<AccountRoleProjectEntity>) {
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
  project_id: string;
  @Type(() => RoleDto)
  roles: AssignAccountRoleDto[];

  constructor(partial: Partial<AssignRoleProjectDto>) {
    Object.assign(this, partial);
  }
}

export class AssignRoleDto {
  general?: AccountRole;
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
  generalRole: RoleEntity;
  @Type(() => AssignAccountRoleDto)
  projectRoles: AssignAccountRoleDto[];
  last_login?: string;
  registrations?: boolean;

  constructor(partial: Partial<AccountEntity>) {
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

export class AccountRegisterRequestDto extends StandardWithTimeDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  password: string;
  email: string;
}

export class AccountCreateRequestDto extends AccountRegisterRequestDto {
  @IsNotEmpty()
  @IsEnum(AccountRole)
  role: AccountRole;
}
