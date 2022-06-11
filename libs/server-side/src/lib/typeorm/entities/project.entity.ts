import {Entity, JoinColumn, ManyToOne, OneToMany} from 'typeorm';
import {TaskEntity} from './task.entity';
import {StandardEntityWithTimestamps} from './standard-entities';
import {DbAwareColumn} from '../decorators';
import {AccountRoleProjectEntity} from './account-role-project.entity';
import {FileEntity} from './file.entity';
import {dateTransformer, jsonTransformer} from '../transformers';
import {Transform} from 'class-transformer';

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
  @Transform(({value}: { value: AccountRoleProjectEntity }) => {
    return value.role.label;
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
  file_id!: string;
  @ManyToOne(() => FileEntity)
  @JoinColumn({
    name: 'file_id',
    referencedColumnName: 'id'
  })
  file!: FileEntity;
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
    type: 'text'
  })
  virtual_folder_path!: string;
  @DbAwareColumn({
    type: 'text'
  })
  virtual_filename!: string;
}
