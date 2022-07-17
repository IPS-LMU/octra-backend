import {Entity, OneToOne} from 'typeorm';
import {StandardEntity} from './standard-entities';
import {DbAwareColumn} from '../decorators';
import {AccountEntity, ProjectEntity} from '@octra/server-side';
import {AccountFieldDefinition} from '../../account-fields';

@Entity({name: 'account_field_definition'})
export class AccountFieldDefinitionEntity extends StandardEntity {
  @DbAwareColumn({
    type: 'text'
  })
  context!: string;

  @DbAwareColumn({
    type: 'text'
  })
  name!: string;
  @DbAwareColumn({
    type: 'text'
  })
  type!: string;
  @DbAwareColumn({
    type: 'jsonb'
  })
  definition!: AccountFieldDefinition;

  @DbAwareColumn({
    type: 'boolean',
    default: false
  })
  remove_value_on_account_delete!: boolean;

  @DbAwareColumn({
    type: 'boolean',
    default: false
  })
  removable!: boolean;

  @DbAwareColumn({
    type: 'integer',
    default: -1
  })
  sort_order!: number;
}

@Entity({name: 'account_field_value'})
export class AccountFieldValueEntity extends StandardEntity {
  @DbAwareColumn({
    type: 'bigint'
  })
  account_field_definition_id!: string;

  @OneToOne(() => AccountFieldDefinitionEntity)
  account_field_definition: AccountFieldDefinitionEntity;

  @DbAwareColumn({
    type: 'bigint'
  })
  account_id!: string;

  @OneToOne(() => AccountEntity)
  account: AccountEntity;

  @DbAwareColumn({
    type: 'bigint'
  })
  project_id?: string;

  @OneToOne(() => ProjectEntity)
  project: ProjectEntity;

  @DbAwareColumn({
    type: 'text'
  })
  value!: string;
}
