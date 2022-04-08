import {AfterLoad, Entity, JoinColumn, ManyToOne, OneToOne} from 'typeorm';
import {Account} from './account.entity';
import {DbAwareColumn} from '../../../obj/decorators';
import {StandardEntityWithTimestamps} from '../../../obj/entities';

@Entity('role')
export class Role extends StandardEntityWithTimestamps {
  @DbAwareColumn({
    type: 'text'
  })
  label?: string

  @DbAwareColumn({
    type: 'text'
  })
  description?: string

  @DbAwareColumn({
    type: 'text',
    nullable: false
  })
  scope: string;
}

@Entity({name: 'account_role_project'})
export class AccountRoleProject extends StandardEntityWithTimestamps {
  @DbAwareColumn({
    type: 'bigint'
  })
  account_id?: number;

  @OneToOne(() => Role, {eager: true})
  @JoinColumn({
    name: 'role_id',
    referencedColumnName: 'id'
  })
  role: Role;

  @DbAwareColumn({
    type: 'bigint'
  })
  project_id: number;

  @DbAwareColumn({
    type: 'timestamp without time zone'
  })
  valid_startdate?: string;

  @DbAwareColumn({
    type: 'timestamp without time zone'
  })
  valid_enddate?: string;

  @ManyToOne(() => Account)
  @JoinColumn({
    name: 'account_id',
    referencedColumnName: 'id'
  })
  account: Account;

  @AfterLoad()
  _convertNumerics() {
    this.id = parseInt(this.id as any);
  }
}
