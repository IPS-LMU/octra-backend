import {IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString} from 'class-validator';
import {StandardWithTimeDto} from '../standard.dto';
import {ApiHideProperty, ApiProperty, OmitType, PartialType} from '@nestjs/swagger';
import {AccountRole, ProjectVisibility} from '@octra/api-types';
import {RoleDto} from '../account/account.dto';
import {Expose, Transform} from 'class-transformer';
import {AccountRoleProjectEntity, IsOptionalString, ProjectEntity, removeProperties} from '@octra/server-side';

export class ProjectRequestDto extends PartialType(OmitType(StandardWithTimeDto, ['id', 'creationdate', 'updatedate'])) {
  @IsNotEmpty()
  @ApiProperty({
    description: 'name of the project.',
    example: 'TestProject'
  })
  name: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'short identifier of the project.',
    example: 'testproj'
  })
  shortname: string;

  @IsNotEmpty()
  @IsEnum(ProjectVisibility)
  @ApiProperty({
    description: 'visibility of the project.',
    example: 'public'
  })
  visibility: ProjectVisibility;

  @IsOptionalString()
  @ApiProperty({
    description: 'short description of the project',
    example: 'This project is for the orthographic transcription of speech recordings.'
  })
  description?: string;


  @IsOptional()
  @ApiProperty({
    description: 'projectConfiguration',
    example: {
      someConfig: '...'
    }
  })
  configuration?: any;

  @IsOptional()
  @ApiProperty({
    description: 'start date of the project (ISO 8601)',
    example: new Date(),
    type: 'string'
  })
  @Transform(({value}) => {
    if (typeof value === 'string') {
      return new Date(value);
    }
    return value;
  })
  startdate?: Date;

  @IsOptional()
  @ApiProperty({
    description: 'end date of the project (ISO 8601)',
    example: new Date(),
    type: 'string'
  })
  enddate?: Date;

  @IsOptional()
  @ApiProperty({
    description: 'describes if the project is active',
    example: true
  })
  active?: boolean;

  constructor(partial: Partial<ProjectDto>) {
    super();
    partial = removeProperties(partial, ['id', 'roles']);
    Object.assign(this, partial);
  }
}

export class ProjectDto extends StandardWithTimeDto {
  @IsNotEmpty()
  id: string;
  @IsString()
  @ApiProperty({
    description: 'name of the project.',
    example: 'TestProject'
  })
  name: string;
  @ApiProperty({
    description: 'describes if the project is active',
    example: true
  })
  active: boolean;
  @IsNotEmpty()
  @IsEnum(ProjectVisibility)
  @ApiProperty({
    description: 'visibility of the project.',
    example: 'public'
  })
  visibility: ProjectVisibility;
  @ApiProperty({
    description: 'short identifier of the project.',
    example: 'testproj'
  })
  shortname?: string;
  @ApiProperty({
    description: 'short description of the project',
    example: 'This project is for the orthographic transcription of speech recordings.'
  })
  description?: string;
  @ApiProperty({
    description: 'projectConfiguration',
    example: {
      someConfig: '...'
    }
  })
  configuration?: any;
  @Expose({
    groups: [AccountRole.administrator, AccountRole.projectAdministrator]
  })
  @ApiProperty({
    description: 'start date of the project (ISO 8601)',
    example: new Date(),
    type: 'string'
  })
  startdate?: Date;
  @Expose({
    groups: [AccountRole.administrator, AccountRole.projectAdministrator]
  })
  @ApiProperty({
    description: 'end date of the project (ISO 8601)',
    example: new Date(),
    type: 'string'
  })
  enddate?: Date;
  @Expose({
    groups: [AccountRole.administrator]
  })
  @ApiHideProperty()
  creationdate: Date;
  @Expose({
    groups: [AccountRole.administrator]
  })
  @ApiHideProperty()
  updatedate: Date;

  @Expose({
    groups: [AccountRole.administrator]
  })
  @Transform(({value}) => {
    if (value) {
      return value.map((a) => {
        return new ProjectRoleDto(a);
      });
    }
    return value;
  })
  roles: ProjectRoleDto[];

  constructor(partial: Partial<ProjectEntity>) {
    super();
    Object.assign(this, partial);
  }
}

export class ProjectRoleDto extends PartialType(
  OmitType(RoleDto, ['project_name', 'project_id', 'scope'] as const)
) {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'role of the account',
    example: 'project_admin'
  })
  role: AccountRole;

  @IsNotEmpty()
  @ApiProperty({
    description: 'account id',
    example: '24365'
  })
  account_id: string;

  @ApiProperty({
    description: 'account name',
    example: 'testUser'
  })
  account_name?: string;

  constructor(partial: Partial<AccountRoleProjectEntity>) {
    super();
    let newObj: ProjectRoleDto = partial as any;

    newObj = {
      ...newObj,
      role: partial.role.label,
      account_id: partial.account_id,
      account_name: partial.account?.account_person?.username
    }

    newObj = removeProperties(newObj, ['id', 'role_id', 'project_id', 'project_name', 'scope']);
    Object.assign(this, newObj);
  }
}

export class ProjectAssignRoleDto extends PartialType(
  OmitType(RoleDto, ['project_name', 'project_id', 'scope'] as const)
) {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'role of the account',
    example: 'project_admin'
  })
  role: AccountRole;

  @IsNotEmpty()
  @ApiProperty({
    description: 'account id',
    example: '24365'
  })
  account_id: string;

  constructor(partial: Partial<AccountRoleProjectEntity>) {
    super();
    let newObj: ProjectRoleDto = partial as any;

    newObj = {
      ...newObj,
      role: partial.role.label,
      account_id: partial.account_id
    }

    newObj = removeProperties(newObj, ['id', 'role_id', 'project_id', 'project_name', 'scope']);
    Object.assign(this, newObj);
  }
}

export class ProjectRemoveRequestDto {
  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    description: 'describes if all references to this project shall be deleted.',
    example: false
  })
  removeAllReferences: boolean;
  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    description: 'describes if all references should be set to null. Data entries still exist.',
    example: true
  })
  cutAllReferences: boolean;
  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    description: 'describes if all files related to the project shall be deleted.',
    example: false
  })
  removeProjectFiles: boolean;
}
