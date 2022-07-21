import {Entity, JoinColumn, OneToMany, OneToOne} from 'typeorm';
import {AccountRoleProjectEntity, RoleEntity} from './account-role-project.entity';
import {DbAwareColumn} from '../decorators';
import {StandardEntity, StandardEntityWithTimestamps} from './standard-entities';
import {dateTransformer} from '../transformers';
import {AccountPersonGender} from '@octra/api-types';

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

  @DbAwareColumn({type: 'boolean', default: true})
  active!: boolean;

  @DbAwareColumn({
    type: 'text'
  })
  hash?: string;

  @DbAwareColumn({
    type: 'text'
  })
  gender: AccountPersonGender;

  @DbAwareColumn({
    type: 'text'
  })
  first_name: string;

  @DbAwareColumn({
    type: 'text'
  })
  last_name: string;

  @DbAwareColumn({
    type: 'text',
    nullable: true
  })
  organization: string;

  @DbAwareColumn({
    type: 'timestamp without time zone',
    nullable: true
  })
  birthday: Date;

  @DbAwareColumn({
    type: 'text',
    nullable: true
  })
  street: string;

  @DbAwareColumn({
    type: 'text',
    nullable: true
  })
  street_number: string;

  @DbAwareColumn({
    type: 'text',
    nullable: true
  })
  town: string;

  @DbAwareColumn({
    type: 'text',
    nullable: true
  })
  postcode: string;

  @DbAwareColumn({
    type: 'text',
    nullable: true
  })
  state: string;

  @DbAwareColumn({
    type: 'text',
    nullable: true
  })
  country: string;

  @DbAwareColumn({
    type: 'text',
    nullable: true
  })
  phone: string;
}

@Entity({name: 'account'})
export class AccountEntity extends StandardEntityWithTimestamps {
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
    transformer: dateTransformer
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
