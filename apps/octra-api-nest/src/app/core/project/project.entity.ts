import {Entity, JoinColumn, ManyToOne, OneToMany} from 'typeorm';
import {DbAwareColumn} from '../../obj/decorators';
import {StandardEntityWithTimestamps} from '../../obj/entities';
import {AccountRoleProjectEntity} from '../account/entities/account-role-project.entity';
import {TaskEntity} from './task.entity';
import {FileEntity} from '../files/file.entity';

@Entity({name: 'project'})
export class ProjectEntity extends StandardEntityWithTimestamps {
  @DbAwareColumn({
    type: 'text',
    nullable: false
  })
  name: string;
  @DbAwareColumn({
    type: 'text'
  })
  shortname: string;
  @DbAwareColumn({
    type: 'text'
  })
  description: string;
  @DbAwareColumn({
    type: 'json'
  })
  configuration: any;
  @DbAwareColumn({
    type: 'timestamp without time zone'
  })
  startdate: Date;
  @DbAwareColumn({
    type: 'timestamp without time zone'
  })
  enddate: Date;
  @DbAwareColumn({
    type: 'boolean'
  })
  active: boolean;

  @OneToMany(() => AccountRoleProjectEntity, (accountRole) => accountRole.project)
  @JoinColumn({
    name: 'id',
    referencedColumnName: 'project_id'
  })
  roles: AccountRoleProjectEntity[];

  @OneToMany(() => TaskEntity, (taskEntity) => taskEntity.project)
  @JoinColumn({
    name: 'id',
    referencedColumnName: 'project_id'
  })
  tasks: TaskEntity[];
}

@Entity({name: 'file_project'})
export class FileProjectEntity extends StandardEntityWithTimestamps {
  @DbAwareColumn({
    type: 'bigint'
  })
  file_id: number;
  @ManyToOne(() => FileEntity)
  @JoinColumn({
    name: 'file_id',
    referencedColumnName: 'id'
  })
  file: FileEntity;
  @DbAwareColumn({
    type: 'bigint'
  })
  project_id: number;

  @ManyToOne(() => ProjectEntity)
  @JoinColumn({
    name: 'project_id',
    referencedColumnName: 'id'
  })
  project: ProjectEntity;
  @DbAwareColumn({
    type: 'text'
  })
  virtual_folder_path: string;
  @DbAwareColumn({
    type: 'text'
  })
  virtual_filename: string;
}
