import {IsBoolean, IsNotEmpty, IsNumber, IsString} from 'class-validator';
import {StandardWithTimeDto} from '../standard.dto';
import {removeProperties} from '../../../../../../libs/server-side/src/lib/functions';
import {ApiHideProperty} from '@nestjs/swagger';
import {AccountRole} from '@octra/api-types';

export class ProjectRequestDto extends StandardWithTimeDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  shortname: string;
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
  @IsNotEmpty()
  active: boolean;
  shortname?: string;

  constructor(partial: Partial<ProjectDto>) {
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
