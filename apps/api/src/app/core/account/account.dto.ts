import {StandardWithTimeDto} from '../standard.dto';
import {IsEmail, IsEnum, IsNotEmpty} from 'class-validator';
import {Expose, Transform, Type} from 'class-transformer';
import {ApiProperty, OmitType, PartialType} from '@nestjs/swagger';
import {AccountLoginMethod, AccountRole, AccountRoleScope} from '@octra/api-types';
import {AccountEntity, AccountRoleProjectEntity, removeProperties} from '@octra/server-side';

export class RoleDto {
  @IsNotEmpty()
  role: AccountRole;
  @IsNotEmpty()
  scope: AccountRoleScope;
  project_id?: string;
  project_name?: string;
  @Expose({
    groups: [AccountRole.administrator]
  })
  valid_startdate?: string;
  @Expose({
    groups: [AccountRole.administrator]
  })
  valid_enddate?: string;

  constructor(partial: Partial<AccountRoleProjectEntity>) {
    let newObj: RoleDto = partial as any;

    newObj = {
      ...newObj,
      role: partial.role?.label,
      scope: partial.role?.scope
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
  @ApiProperty({
    description: 'username of the account',
    example: 'testuser'
  })
  username: string;
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: 'email address of the account',
    example: 'email@test.com'
  })
  email: string;
  @IsNotEmpty()
  @IsEnum(AccountLoginMethod)
  @ApiProperty({
    description: 'login method',
    example: 'local'
  })
  loginmethod: AccountLoginMethod;
  @IsNotEmpty()
  @ApiProperty({
    description: 'describes if the account is active.',
    example: true
  })
  active: boolean;
  @IsNotEmpty()
  @ApiProperty({
    description: 'describes the set of skills of this user.',
    example: 'orthographic transcription'
  })
  training?: string;
  @ApiProperty({
    description: 'some comment about this account.',
    example: 'Some comment.'
  })
  comment?: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'the general user role.',
    example: true
  })
  @Transform(({value}) => value.label)
  generalRole: AccountRole;
  @Type(() => AssignAccountRoleDto)

  @ApiProperty({
    description: 'user roles of this account associated to specific projects.',
    example: true
  })
  projectRoles: AssignAccountRoleDto[];

  @ApiProperty({
    description: 'date on that this account logged in.',
    example: new Date()
  })
  last_login?: Date;

  constructor(partial: Partial<AccountEntity>) {
    super();
    let newObj: AccountDto = partial as any;

    newObj = {
      ...newObj,
      ...removeProperties(partial.account_person, ['id', 'hash']),
      projectRoles: partial.roles.map(a => removeProperties(new RoleDto(a), ['scope', 'id']))
    }
    // add transformation if account person doesnt exist
    newObj = removeProperties(newObj, ['account_person', 'role_id', 'roles']);

    Object.assign(this, newObj);
  }
}

export class ChangePasswordDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'the previous password.',
    example: '278z42374z2834z72'
  })
  oldPassword: string;
  @IsNotEmpty()
  @ApiProperty({
    description: 'the new password.',
    example: '2673tg486b72t3678et8w'
  })
  newPassword: string;
}

export class AccountRegisterRequestDto extends StandardWithTimeDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'account name',
    example: 'testuser'
  })
  name: string;
  @IsNotEmpty()
  @ApiProperty({
    description: 'password of the account',
    example: 'asdasda2345345243'
  })
  password: string;
  @IsEmail()
  @ApiProperty({
    description: 'account email',
    example: 'test@test.com'
  })
  email: string;
}

export class AccountCreateRequestDto extends AccountRegisterRequestDto {
  @IsNotEmpty()
  @IsEnum(AccountRole)
  @ApiProperty({
    description: 'general account role',
    example: 'test@test.com'
  })
  role: AccountRole;
}
