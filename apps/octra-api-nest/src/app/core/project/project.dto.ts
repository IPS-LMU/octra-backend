import {IsNotEmpty} from 'class-validator';
import {StandardWithTimeDto} from '../standard.dto';
import {removeProperties} from '../../functions';
import {ApiHideProperty} from '@nestjs/swagger';

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
  id: number;
  @IsNotEmpty()
  active: boolean;
  shortname?: string;

  constructor(partial: Partial<ProjectDto>) {
    super();
    Object.assign(this, partial);
  }
}
