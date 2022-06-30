import {Entity, JoinColumn, ManyToOne, OneToMany} from 'typeorm';
import {TaskEntity} from './task.entity';
import {StandardEntityWithTimestamps} from './standard-entities';
import {DbAwareColumn} from '../decorators';
import {AccountRoleProjectEntity} from './account-role-project.entity';
import {dateTransformer, jsonTransformer} from '../transformers';
import {AccountEntity} from './account.entity';
import {AudioFileMetaData} from '@octra/api-types';

@Entity({name: 'project'})
export class ProjectEntity extends StandardEntityWithTimestamps {
  @DbAwareColumn({
    type: 'text',
    nullable: false
  })
  name!: string;
  @DbAwareColumn({
    type: 'text'
  })
  shortname!: string;
  @DbAwareColumn({
    type: 'text'
  })
  visibility!: string;
  @DbAwareColumn({
    type: 'text'
  })
  description!: string;
  @DbAwareColumn({
    type: 'json',
    transformer: jsonTransformer
  })
  configuration: any;
  @DbAwareColumn({
    type: 'timestamp without time zone',
    transformer: dateTransformer
  })
  startdate!: Date;
  @DbAwareColumn({
    type: 'timestamp without time zone',
    transformer: dateTransformer
  })
  enddate!: Date;
  @DbAwareColumn({
    type: 'boolean',
    default: true
  })
  active!: boolean;

  @OneToMany(() => AccountRoleProjectEntity, (accountRole) => accountRole.project)
  @JoinColumn({
    name: 'id',
    referencedColumnName: 'project_id'
  })
  roles!: AccountRoleProjectEntity[];

  @OneToMany(() => TaskEntity, (taskEntity) => taskEntity.project)
  @JoinColumn({
    name: 'id',
    referencedColumnName: 'project_id'
  })
  tasks!: TaskEntity[];
}

@Entity({name: 'file_project'})
export class FileProjectEntity extends StandardEntityWithTimestamps {
  @DbAwareColumn({
    type: 'bigint'
  })
  project_id!: string;

  @ManyToOne(() => ProjectEntity)
  @JoinColumn({
    name: 'project_id',
    referencedColumnName: 'id'
  })
  project!: ProjectEntity;


  @DbAwareColumn({
    type: 'text',
    nullable: true
  })
  path: string;

  @DbAwareColumn({
    type: 'text',
    nullable: true
  })
  url: string;

  @DbAwareColumn({
    type: 'text',
    nullable: true
  })
  type?: string;

  @DbAwareColumn({
    type: 'bigint',
    nullable: true
  })
  size?: number;

  @DbAwareColumn({
    type: 'bigint',
    nullable: true
  })
  uploader_id?: string;

  @ManyToOne(() => AccountEntity)
  @JoinColumn({
    name: 'uploader_id',
    referencedColumnName: 'id'
  })
  uploader!: AccountEntity;

  @DbAwareColumn({
    type: 'bigint',
    nullable: true
  })
  real_name?: string;

  @DbAwareColumn({
    type: 'text',
    nullable: true,
    unique: true
  })
  hash?: string;

  @DbAwareColumn({
    type: 'jsonb',
    nullable: true,
    transformer: jsonTransformer
  })
  metadata?: AudioFileMetaData;
}
