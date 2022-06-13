import {IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString} from 'class-validator';
import {StandardWithTimeDto} from '../standard.dto';
import {removeProperties} from '../../../../../../libs/server-side/src/lib/functions';
import {ApiHideProperty} from '@nestjs/swagger';
import {AccountRole, ProjectVisibility} from '@octra/api-types';
import {RoleDto} from '../account/account.dto';
import {Expose, Transform} from 'class-transformer';
import {ProjectEntity} from '@octra/server-side';

export class ProjectRequestDto extends StandardWithTimeDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  shortname: string;
  @IsNotEmpty()
  @IsEnum(ProjectVisibility)
  visibility: ProjectVisibility;
  description?: string;
  configuration?: any;
  startdate?: Date;
  enddate?: Date;
  active?: boolean;
  @ApiHideProperty()
  creationdate: Date;
  @ApiHideProperty()
  updatedate: Date;


  constructor(partial: Partial<ProjectDto>) {
    super();
    partial = removeProperties(partial, ['id']);
    Object.assign(this, partial);
  }
}

export class ProjectDto extends StandardWithTimeDto {
  @IsNotEmpty()
  id: string;
  name: string;
  active: boolean;
  shortname?: string;
  description?: string;
  configuration?: any;
  @Expose({
    groups: [AccountRole.administrator, AccountRole.projectAdministrator]
  })
  startdate?: Date;
  @Expose({
    groups: [AccountRole.administrator, AccountRole.projectAdministrator]
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
      return value.map(a => new RoleDto(a));
    }
    return value;
  })
  roles: RoleDto[];

  constructor(partial: Partial<ProjectEntity>) {
    super();
    Object.assign(this, partial);
  }
}

export class ProjectAssignRolesRequestDto {
  @IsNotEmpty()
  @IsNumber()
  account_id: string;
  @IsNotEmpty()
  @IsString()
  role: AccountRole;
}

export class ProjectRemoveRequestDto {
  @IsNotEmpty()
  @IsBoolean()
  removeAllReferences: boolean;
  @IsNotEmpty()
  @IsBoolean()
  cutAllReferences: boolean;
  @IsNotEmpty()
  @IsBoolean()
  removeProjectFiles: boolean;
}
