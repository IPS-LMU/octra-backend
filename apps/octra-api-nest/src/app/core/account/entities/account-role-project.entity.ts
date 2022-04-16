import {AfterLoad, Entity, JoinColumn, ManyToOne, OneToOne} from 'typeorm';
import {Account} from './account.entity';
import {DbAwareColumn} from '../../../obj/decorators';
import {StandardEntityWithTimestamps} from '../../../obj/entities';
import {UserRole, UserRoleScope} from '@octra/octra-api-types';

@Entity('role')
export class Role extends StandardEntityWithTimestamps {
  @DbAwareColumn({
    type: 'text'
  })
  label?: UserRole

  @DbAwareColumn({
    type: 'text'
  })
  description?: string

  @DbAwareColumn({
    type: 'text',
    nullable: false
  })
  scope: UserRoleScope;
}

@Entity({name: 'account_role_project'})
export class AccountRoleProject extends StandardEntityWithTimestamps {
  @DbAwareColumn({
    type: 'bigint'
  })
  account_id?: number;

  @DbAwareColumn({
    type: 'bigint'
  })
  role_id: number;

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

  constructor(partial: Partial<AccountRoleProject>) {
    super();
    Object.assign(this, partial);
  }
}
