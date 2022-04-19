import {StandardEntityWithTimestamps} from '../../obj/entities';
import {DbAwareColumn} from '../../obj/decorators';
import {TaskStatus} from '@octra/octra-api-types';
import {Entity, JoinColumn, OneToOne} from 'typeorm';
import {ToolEntity} from '../tool/tool.entity';
import {ProjectEntity} from './project.entity';
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
  @OneToOne(() => ProjectEntity)
  @JoinColumn({
    referencedColumnName: 'id',
    name: 'tool_id'
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
  @OneToOne(() => AccountEntity)
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
}
