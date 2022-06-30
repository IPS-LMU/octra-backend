import {plainToInstance, Transform, Type} from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import {HasMimeType, IsFiles} from 'nestjs-form-data';
import {FileHashStorage} from '../../../obj/file-hash-storage';
import {AudioFileMetaData, TaskInputOutputCreatorType, TaskStatus} from '@octra/api-types';
import {StandardWithTimeDto} from '../../standard.dto';
import {
  AnnotJSONType,
  IsOptionalEnum,
  IsOptionalNotEmptyString,
  IsOptionalNumber,
  IsOptionalString,
  removeProperties,
  TaskEntity,
  TranscriptDto,
  TranscriptType
} from '@octra/server-side';
import {ApiProperty} from '@nestjs/swagger';

export enum TaskType {
  'annotation' = 'annotation'
}

export class AudioDurationDto {
  @IsNumber()
  samples: number;
  @IsNumber()
  seconds: number;
}

export class TaskUploadMediaDto {
  @IsNotEmpty()
  @IsString()
  url: string;
  @IsOptionalNumber()
  bitRate?: number;
  @IsOptionalNumber()
  numberOfChannels?: number;
  @IsOptional()
  @IsObject()
  @ValidateNested()
  duration?: AudioDurationDto;
  @IsOptionalNumber()
  sampleRate?: number;
  @IsOptionalString()
  container?: string;
  @IsOptionalString()
  codec?: string;
  @IsOptional()
  @IsBoolean()
  lossless?: boolean;
}

export class TaskProperties {
  /*   currently only "annotation" is supported */
  @IsEnum(TaskType)
  @IsNotEmpty()
  type: TaskType;
  /* id for scientific issues */
  @IsOptionalNotEmptyString()
  pid?: string;
  /*  text with task related instructions or descriptions */
  @IsOptionalString()
  orgtext?: string;
  /* assessment of the user's transcription like difficulty etc. */
  @IsOptionalNotEmptyString()
  assessment?: string;
  /* priority of the task. It affects the selection of tasks (order by descending priority) */
  @IsOptionalNumber()
  priority?: number;
  @IsOptionalString()
  code?: string;
  /* recorded timestamp when task begins */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startdate?: Date;
  /* recorded timestamp when worker finishes task. */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  enddate?: Date;
  /* comment by user. */
  @IsOptionalString()
  comment?: string;
  /* id of the tool that should be used for this task */
  @IsOptionalNumber()
  tool_id?: string;
  /* comment by project administrator */
  @IsOptionalString()
  admin_comment?: string;
  /* id of the worker who should do this task */
  @IsOptionalNumber()
  worker_id?: string;
  /* id of the next task. The task must already exist. */
  @IsOptionalNumber()
  nexttask_id?: string;
  /* destination where the files need to be uploaded to. */
  @IsOptionalString()
  files_destination?: string;

  /* only fill in this data if you don't upload a media file. The URL of the media file must exist. */
  @IsOptional()
  @ValidateNested()
  media?: TaskUploadMediaDto;

  /* logging data from task */
  @IsOptional()
  @IsArray()
  @IsObject({each: true})
  log?: any[];

  @IsOptionalEnum(TaskStatus)
  status?: TaskStatus;

  constructor(partial: Partial<TaskProperties>) {
    partial = {
      ...partial,
      startdate: partial.startdate ? new Date(partial.startdate) : undefined,
      enddate: partial.enddate ? new Date(partial.enddate) : undefined
    };

    Object.assign(this, partial);
  }
}

export class TaskInputOutputDto {
  type: 'input' | 'output';
  creator_type: TaskInputOutputCreatorType;
  label: string;
  description?: string;
  filename: string;
  url: string;
  content?: any;
  fileType?: string;
  size?: number;
  metadata?: AudioFileMetaData;

  constructor(partial: Partial<TaskInputOutputDto>) {
    Object.assign(this, partial);
  }
}

export class TaskDto extends StandardWithTimeDto {
  pid: string;
  orgtext: string;
  assessment: string;
  priority: number;
  status: TaskStatus;
  code: string;
  startdate: string;
  enddate: string;
  log: any;
  comment: string;
  tool_id: string;
  admin_comment: string;
  worker_id: string;
  nexttask_id: string;
  type: string;

  @Type(() => TaskInputOutputDto)
  inputs: TaskInputOutputDto[];
  @Type(() => TaskInputOutputDto)
  outputs: TaskInputOutputDto[];

  constructor(partial: Partial<TaskEntity>) {
    super();
    const taskInputsOutputs = partial.inputsOutputs?.map(a => new TaskInputOutputDto({
      type: a.type,
      creator_type: a.creator_type,
      label: a.label,
      description: a.description,
      filename: a.filename ?? a.file_project?.real_name,
      url: a.url ?? (a.file_project?.path ?? a.file_project?.url),
      content: a.content,
      fileType: a.file_project?.type,
      size: a.file_project?.size,
      metadata: a.file_project?.metadata
    }));

    let obj = {
      ...partial,
      inputs: taskInputsOutputs.filter(a => a.type === 'input').map(a => {
        a = removeProperties(a, ['type']);
        return a;
      }),
      outputs: taskInputsOutputs.filter(a => a.type === 'output').map(a => {
        a = removeProperties(a, ['type']);
        return a;
      }),
    };
    if (obj.priority < 1) {
      delete obj.priority;
    }

    obj = removeProperties(obj, ['worker', 'project_id', 'project', 'tool', 'nexttask', 'inputsOutputs']);
    Object.assign(this, obj);
  }
}

export class TaskUploadDto {
  /**
   * properties of the task
   */
  @Transform(({value}) => {
    return new TaskProperties(JSON.parse(value));
  }, {toClassOnly: true})
  @Type(() => TaskProperties)
  @ValidateNested()
  @ApiProperty({
    title: 'properties',
    name: 'properties',
    description: 'properties applied to the task'
  })
  properties: TaskProperties;

  /**
   * the type of transcript. If it's "Text" the transcript is going to be converted to AnnotJSON automatically.
   */
  @IsNotEmpty()
  @IsEnum(TranscriptType)
  transcriptType: TranscriptType;

  /**
   * the transcript. Either AnnotJSON or plain Text. See "transcriptType" for more information.
   */
  @Transform(({obj, value}: { obj: TaskUploadDto, value: string }) => {
    if (obj.transcriptType === TranscriptType.AnnotJSON) {
      return plainToInstance(TranscriptDto, JSON.parse(value));
    }
    return plainToInstance(TranscriptDto, new TranscriptDto({
      sampleRate: 0,
      links: [],
      annotates: '',
      name: ``,
      levels: [{
        name: 'CONVERTER_TRN',
        type: AnnotJSONType.SEGMENT,
        items: [
          {
            id: 1,
            labels: [
              {
                name: 'TRN',
                value
              }
            ]
          }
        ]
      }
      ]
    }))
  })
  @Type(() => TranscriptDto)
  @ValidateNested()
  transcript: TranscriptDto;


  /**
   * the input files. Currently, only an audio file (WAVE) is supported.
   */
  @Transform(({value}) => {
    return (value !== undefined && !Array.isArray(value)) ? [value] : value;
  })
  @IsFiles()
  @HasMimeType(['audio/wave', 'application/json', 'text/plain'], {each: true})
  inputs: FileHashStorage[];

  constructor(partial: Partial<TaskUploadDto>) {
    Object.assign(this, partial);
  }
}

export class TaskChangeDto {
  /**
   * properties of the task
   */
  @Transform(({value}) => {
    return new TaskProperties(JSON.parse(value));
  }, {toClassOnly: true})
  @Type(() => TaskProperties)
  @ValidateNested()
  properties: TaskProperties;

  /**
   * the type of transcript. If it's "Text" the transcript is going to be converted to AnnotJSON automatically.
   */
  @IsNotEmpty()
  @IsEnum(TranscriptType)
  transcriptType: TranscriptType;

  /**
   * the transcript. Either AnnotJSON or plain Text. See "transcriptType" for more information.
   */
  @Transform(({obj, value}: { obj: TaskUploadDto, value: string }) => {
    if (obj.transcriptType === TranscriptType.AnnotJSON) {
      return plainToInstance(TranscriptDto, JSON.parse(value));
    }
    return plainToInstance(TranscriptDto, new TranscriptDto({
      sampleRate: 0,
      links: [],
      annotates: '',
      name: ``,
      levels: [{
        name: 'CONVERTER_TRN',
        type: AnnotJSONType.SEGMENT,
        items: [
          {
            id: 1,
            labels: [
              {
                name: 'TRN',
                value
              }
            ]
          }
        ]
      }
      ]
    }))
  })
  @Type(() => TranscriptDto)
  @ValidateNested()
  transcript: TranscriptDto;

  /**
   * the input files. Currently, only an audio file (WAVE) is supported.
   */
  @Transform(({value}) => {
    return (value !== undefined && !Array.isArray(value)) ? [value] : value;
  })
  @IsOptional()
  @HasMimeType(['audio/wave', 'application/json', 'text/plain'], {each: true})
  inputs?: FileHashStorage[];
}

