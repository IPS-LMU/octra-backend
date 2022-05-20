import {Entity, JoinColumn, OneToMany, OneToOne} from 'typeorm';
import {AccountRoleProjectEntity, RoleEntity} from './account-role-project.entity';
import {DbAwareColumn} from '../decorators';
import {StandardEntity, StandardEntityWithTimestamps} from './standard-entities';

@Entity({name: 'account_person'})
export class AccountPersonEntity extends StandardEntity {
  @DbAwareColumn({
    type: 'text'
  })
  username?: string;

  @DbAwareColumn({
    type: 'text'
  })
  email?: string;

  @DbAwareColumn({
    type: 'text'
  })
  loginmethod!: 'local' | 'shibboleth';

  @DbAwareColumn({default: true})
  active!: boolean;

  @DbAwareColumn({
    type: 'text'
  })
  hash?: string;
}

@Entity({name: 'account'})
export class AccountEntity extends StandardEntityWithTimestamps {
  @DbAwareColumn()
  training!: string;

  @DbAwareColumn()
  comment!: string;

  @DbAwareColumn({
    type: 'bigint'
  })
  role_id!: string;

  @OneToOne(() => RoleEntity, {
    eager: true
  })
  @JoinColumn({
    name: 'role_id',
    referencedColumnName: 'id'
  })
  generalRole!: RoleEntity;

  @OneToMany(() => AccountRoleProjectEntity, (accountRoleProject) => accountRoleProject.account, {
    eager: true
  })
  @JoinColumn({referencedColumnName: 'account_id'})
  roles!: AccountRoleProjectEntity[];

  @DbAwareColumn({
    type: 'timestamp without time zone',
    transformer: {
      from(value: any): any {
        return value;
      },
      to(value: any): any {
        if (!value) {
          return new Date();
        }
        return value;
      }
    }
  })
  last_login?: Date;

  @DbAwareColumn({
    type: 'bigint'
  })
  account_person_id!: string;

  @OneToOne(() => AccountPersonEntity, {
    eager: true
  })
  @JoinColumn({
    name: 'account_person_id',
    referencedColumnName: 'id'
  })
  account_person!: AccountPersonEntity;
}
