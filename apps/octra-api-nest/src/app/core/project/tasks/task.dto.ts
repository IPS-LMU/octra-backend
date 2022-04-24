import {Transform} from 'class-transformer';
import {IsNotEmpty, IsString} from 'class-validator';

export class TaskProperties {
  @IsString()
  @IsNotEmpty()
  type: 'annotation';
  pid?: string;
  orgtext?: string;
  assessment?: string;
  priority?: number;
  status?: string;
  code?: string;
  startdate?: string;
  enddate?: string;
  comment?: string;
  tool_id?: number;
  project_id?: number;
  admin_comment?: string;
  worker_id?: number;
  nexttask_id?: number;

  constructor(partial: Partial<TaskProperties>) {
    Object.assign(this, partial);
  }
}

export class TaskUploadDto {
  okKlappt: string;

  @Transform(({value}) => {
    return new TaskProperties(JSON.parse(value));
  })
  properties: TaskProperties;

  @Transform(({value}) => {
    return JSON.parse(value)
  })
  transcript: any;
}
