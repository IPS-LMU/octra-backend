import {IsBoolean, IsEnum, IsNotEmpty, IsString} from 'class-validator';
import {StandardWithTimeDto} from '../standard.dto';
import {removeProperties} from '../../../../../../libs/server-side/src/lib/functions';
import {ApiHideProperty, ApiProperty} from '@nestjs/swagger';
import {AccountRole, ProjectVisibility} from '@octra/api-types';
import {RoleDto} from '../account/account.dto';
import {Expose, Transform} from 'class-transformer';
import {ProjectEntity} from '@octra/server-side';

export class ProjectRequestDto extends StandardWithTimeDto {
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
  @ApiProperty({
    description: 'start date of the project',
    example: new Date()
  })
  startdate?: Date;
  @ApiProperty({
    description: 'end date of the project',
    example: new Date()
  })
  enddate?: Date;
  @ApiProperty({
    description: 'describes if the project is active',
    example: true
  })
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
    description: 'start date of the project',
    example: new Date()
  })
  startdate?: Date;
  @Expose({
    groups: [AccountRole.administrator, AccountRole.projectAdministrator]
  })
  @ApiProperty({
    description: 'end date of the project',
    example: new Date()
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
  @ApiProperty({
    description: 'account id',
    example: '24365'
  })
  account_id: string;
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'role of the account',
    example: 'project_admin'
  })
  role: AccountRole;
}

export class ProjectRemoveRequestDto {
  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    description: 'describes if all references to this project shal be deleted.',
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
