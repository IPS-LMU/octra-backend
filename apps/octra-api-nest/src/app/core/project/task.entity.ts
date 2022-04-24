import {StandardEntity, StandardEntityWithTimestamps} from '../../obj/entities';
import {DbAwareColumn} from '../../obj/decorators';
import {TaskStatus} from '@octra/octra-api-types';
import {Entity, JoinColumn, ManyToOne, OneToMany, OneToOne} from 'typeorm';
import {ToolEntity} from '../tool/tool.entity';
import {FileProjectEntity, ProjectEntity} from './project.entity';
import {AccountEntity} from '../account/entities/account.entity';

@Entity({name: 'task'})
export class TaskEntity extends StandardEntityWithTimestamps {
  @DbAwareColumn({
    type: 'text'
  })
  pid: string;
  @DbAwareColumn({
    type: 'text'
  })
  orgtext: string;
  @DbAwareColumn({
    type: 'text'
  })
  assessment: string;
  @DbAwareColumn({
    type: 'integer'
  })
  priority: number;
  @DbAwareColumn({
    type: 'text'
  })
  status: TaskStatus;
  @DbAwareColumn({
    type: 'text'
  })
  code: TaskStatus;
  @DbAwareColumn({
    type: 'timestamp without time zone'
  })
  startdate: Date;
  @DbAwareColumn({
    type: 'timestamp without time zone'
  })
  enddate: Date;
  @DbAwareColumn({
    type: 'json'
  })
  log: any;
  @DbAwareColumn({
    type: 'text'
  })
  comment: string;
  @DbAwareColumn({
    type: 'integer'
  })
  tool_id: number;
  @OneToOne(() => ToolEntity)
  @JoinColumn({
    referencedColumnName: 'id',
    name: 'tool_id'
  })
  tool: ToolEntity;
  @DbAwareColumn({
    type: 'bigint'
  })
  project_id: number;
  @ManyToOne(() => ProjectEntity, (entity) => entity.tasks)
  @JoinColumn({
    referencedColumnName: 'id',
    name: 'project_id'
  })
  project: ProjectEntity;
  @DbAwareColumn({
    type: 'text'
  })
  admin_comment: string;
  @DbAwareColumn({
    type: 'bigint'
  })
  worker_id: number;
  @ManyToOne(() => AccountEntity)
  @JoinColumn({
    referencedColumnName: 'id',
    name: 'worker_id'
  })
  worker: AccountEntity;
  @DbAwareColumn({
    type: 'bigint'
  })
  nexttask_id: number;
  @OneToOne(() => TaskEntity)
  @JoinColumn({
    referencedColumnName: 'id',
    name: 'nexttask_id'
  })
  nexttask: TaskEntity;
  @DbAwareColumn({
    type: 'text'
  })
  type: string;

  @OneToMany(() => TaskInputOutputEntity, (entity) => entity.task)
  @JoinColumn({
    name: 'id',
    referencedColumnName: 'task_id'
  })
  inputsOutputs: TaskInputOutputEntity[];
}

@Entity({name: 'task_input_output'})
export class TaskInputOutputEntity extends StandardEntity {
  @DbAwareColumn({
    type: 'bigint'
  })
  task_id: number;
  @ManyToOne(() => TaskEntity)
  @JoinColumn({
    name: 'task_id',
    referencedColumnName: 'id'
  })
  task: TaskEntity;
  @DbAwareColumn({
    type: 'bigint',
    nullable: true
  })
  file_project_id?: number;
  @ManyToOne(() => FileProjectEntity)
  @JoinColumn({
    name: 'file_project_id',
    referencedColumnName: 'id'
  })
  file_project: FileProjectEntity;

  @DbAwareColumn({
    type: 'enum',
    enum: ['input', 'output'],
    nullable: false
  })
  type: 'input' | 'output';

  @DbAwareColumn({
    type: 'text',
    nullable: false
  })
  creator_type: string;
  @DbAwareColumn({
    type: 'text',
    nullable: false
  })
  label: string;
  @DbAwareColumn({
    type: 'text',
    nullable: true
  })
  description?: string;
  @DbAwareColumn({
    type: 'text',
    nullable: true
  })
  filename?: string;
  @DbAwareColumn({
    type: 'text',
    nullable: true
  })
  url?: string;
  @DbAwareColumn({
    type: 'json',
    nullable: true
  })
  content?: any;
}
