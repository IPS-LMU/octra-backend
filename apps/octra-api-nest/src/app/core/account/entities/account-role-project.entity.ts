import {AfterLoad, Entity, JoinColumn, ManyToOne, OneToOne} from 'typeorm';
import {AccountEntity} from './account.entity';
import {DbAwareColumn} from '../../../obj/decorators';
import {StandardEntityWithTimestamps} from '../../../obj/entities';
import {AccountRole, AccountRoleScope} from '@octra/octra-api-types';
import {ProjectEntity} from '../../project/project.entity';

@Entity('role')
export class RoleEntity extends StandardEntityWithTimestamps {
  @DbAwareColumn({
    type: 'text'
  })
  label?: AccountRole

  @DbAwareColumn({
    type: 'text'
  })
  description?: string

  @DbAwareColumn({
    type: 'text',
    nullable: false
  })
  scope: AccountRoleScope;
}

@Entity({name: 'account_role_project'})
export class AccountRoleProjectEntity extends StandardEntityWithTimestamps {
  @DbAwareColumn({
    type: 'bigint'
  })
  account_id?: number;

  @DbAwareColumn({
    type: 'bigint'
  })
  role_id: number;

  @OneToOne(() => RoleEntity, {eager: true})
  @JoinColumn({
    name: 'role_id',
    referencedColumnName: 'id'
  })
  role: RoleEntity;

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
    type: 'timestamp without time zone'
  })
  valid_startdate?: string;

  @DbAwareColumn({
    type: 'timestamp without time zone'
  })
  valid_enddate?: string;

  @ManyToOne(() => AccountEntity)
  @JoinColumn({
    name: 'account_id',
    referencedColumnName: 'id'
  })
  account: AccountEntity;

  @AfterLoad()
  _convertNumerics() {
    this.id = parseInt(this.id as any);
  }

  constructor(partial: Partial<AccountRoleProjectEntity>) {
    super();
    Object.assign(this, partial);
  }
}
