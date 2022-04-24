import {Transform, Type} from 'class-transformer';
import {IsEnum, IsNotEmpty, ValidateNested} from 'class-validator';
import {FileSystemStoredFile, HasMimeType, IsFiles} from 'nestjs-form-data';

export enum TaskType {
  'annotation' = 'annotation'
}

export class TaskProperties {
  @IsEnum(TaskType)
  @IsNotEmpty()
  type: 'string';
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
  @Transform(({value}) => {
    return new TaskProperties(JSON.parse(value));
  })
  @Type(() => TaskProperties)
  @ValidateNested()
  properties: TaskProperties;

  @Transform(({value}) => {
    return JSON.parse(value)
  })
  transcript: any;


  @Transform(({value}) => {
    return (value !== undefined && !Array.isArray(value)) ? [value] : value;
  })
  @IsFiles()
  @HasMimeType(['audio/wave'], {each: true})
  inputs: FileSystemStoredFile[];
}
