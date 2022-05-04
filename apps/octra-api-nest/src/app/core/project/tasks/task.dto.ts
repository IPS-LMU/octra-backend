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
import {
  IsOptionalEnum,
  IsOptionalNotEmptyString,
  IsOptionalNumber,
  IsOptionalString
} from '../../../obj/decorators/custom-validators.decorator';
import {AnnotationDto, AnnotJSONType, TranscriptType} from '../annotations/annotation.dto';
import {TaskEntity} from '../task.entity';
import {removeProperties} from '../../../functions';
import {TaskInputOutputCreatorType, TaskStatus} from '@octra/octra-api-types';
import {AudioFileMetaData} from '@octra/db';
import {StandardWithTimeDto} from '../../standard.dto';

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
  tool_id?: number;
  /* comment by project administrator */
  @IsOptionalString()
  admin_comment?: string;
  /* id of the worker who should do this task */
  @IsOptionalNumber()
  worker_id?: number;
  /* id of the next task. The task must already exist. */
  @IsOptionalNumber()
  nexttask_id?: number;

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
  tool_id: number;
  admin_comment: string;
  worker_id: number;
  nexttask_id: number;
  type: string;

  @Type(() => TaskInputOutputDto)
  inputs: TaskInputOutputDto[];
  @Type(() => TaskInputOutputDto)
  outputs: TaskInputOutputDto[];

  constructor(partial: Partial<TaskEntity>) {
    super();
    const taskInputsOutputs = partial.inputsOutputs.map(a => new TaskInputOutputDto({
      type: a.type,
      creator_type: a.creator_type,
      label: a.label,
      description: a.description,
      filename: a.filename ?? a.file_project?.virtual_filename,
      url: a.url ?? a.file_project?.file?.url,
      content: a.content,
      fileType: a.file_project?.file?.type,
      size: a.file_project?.file?.size,
      metadata: a.file_project?.file?.metadata
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
      return plainToInstance(AnnotationDto, JSON.parse(value));
    }
    return plainToInstance(AnnotationDto, new AnnotationDto({
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
  @Type(() => AnnotationDto)
  @ValidateNested()
  transcript: AnnotationDto;


  /**
   * the input files. Currently, only an audio file (WAVE) is supported.
   */
  @Transform(({value}) => {
    return (value !== undefined && !Array.isArray(value)) ? [value] : value;
  })
  @IsFiles()
  @HasMimeType(['audio/wave', 'application/json', "text/plain"], {each: true})
  inputs: FileHashStorage[];
}
