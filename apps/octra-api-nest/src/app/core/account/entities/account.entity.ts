import {Entity, JoinColumn, OneToMany, OneToOne} from 'typeorm';
import {DbAwareColumn} from '../../../obj/decorators/';
import {AccountRoleProject, Role} from './account-role-project.entity';
import {StandardEntity, StandardEntityWithTimestamps} from '../../../obj/entities';

@Entity({name: 'account_person'})
export class AccountPerson extends StandardEntity {
  @DbAwareColumn()
  username?: string;

  @DbAwareColumn()
  email?: string;

  @DbAwareColumn()
  loginmethod: string;

  @DbAwareColumn({default: true})
  active: boolean;

  @DbAwareColumn()
  hash?: string;
}

@Entity({name: 'account'})
export class Account extends StandardEntityWithTimestamps {
  @DbAwareColumn()
  training: string;

  @DbAwareColumn()
  comment: string;

  @DbAwareColumn({
    type: 'bigint'
  })
  role_id: number;

  @OneToOne(() => Role, {
    eager: true
  })
  @JoinColumn({
    name: 'role_id'
  })
  generalRole: Role;

  @OneToMany(() => AccountRoleProject, (accountRoleProject) => accountRoleProject.account, {
    eager: true
  })
  @JoinColumn({referencedColumnName: 'account_id'})
  roles: AccountRoleProject[];

  @DbAwareColumn()
  last_login?: string;

  @OneToOne(() => AccountPerson, {
    eager: true
  })
  @JoinColumn({
    name: 'account_person_id'
  })
  account_person: AccountPerson;
}
