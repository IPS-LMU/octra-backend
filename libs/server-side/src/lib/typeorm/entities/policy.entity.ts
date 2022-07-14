import {Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {DbAwareColumn, DbAwareCreateDate} from '../decorators';
import {AccountEntity} from '@octra/server-side';
import {PolicyType} from '@octra/api-types';

@Entity({name: 'policy'})
export class PolicyEntity {
  @PrimaryGeneratedColumn({
    type: 'integer'
  })
  id: number;
  @DbAwareColumn({
    type: 'text'
  })
  type!: PolicyType;
  @DbAwareColumn({
    type: 'integer'
  })
  version!: number;

  @OneToMany(() => PolicyTranslationEntity, (translation) => translation.policy, {eager: true})
  translations?: PolicyTranslationEntity[];

  @DbAwareColumn({
    type: 'timestamp without time zone',
    nullable: true
  })
  publishdate?: Date;

  @DbAwareCreateDate()
  creationdate!: Date;
}

@Entity({name: 'policy_account_consent'})
export class PolicyAccountConsentEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint'
  })
  id!: number;

  @DbAwareColumn({
    type: 'integer'
  })
  policy_id!: number;

  @OneToOne(() => PolicyEntity)
  @JoinColumn({
    name: 'policy_id',
    referencedColumnName: 'id'
  })
  policy: PolicyEntity;

  @DbAwareColumn({
    type: 'bigint'
  })
  account_id!: string;

  @ManyToOne(() => AccountEntity)
  @JoinColumn({
    name: 'account_id',
    referencedColumnName: 'id'
  })
  account: AccountEntity;

  @DbAwareColumn({
    type: 'timestamp without time zone'
  })
  consentdate: Date;
}

@Entity({name: 'policy_translation'})
export class PolicyTranslationEntity {
  @PrimaryGeneratedColumn({
    type: 'integer'
  })
  id!: number;

  @DbAwareColumn({
    type: 'integer'
  })
  policy_id!: number;

  @DbAwareColumn({
    type: 'text'
  })
  language!: string;

  @ManyToOne(() => PolicyEntity)
  @JoinColumn({
    name: 'policy_id',
    referencedColumnName: 'id'
  })
  policy: PolicyEntity;

  @DbAwareColumn({
    type: 'text',
    nullable: true
  })
  url?: string;
  @DbAwareColumn({
    type: 'text',
    nullable: true
  })
  text?: string;

  @DbAwareColumn({
    type: 'bigint'
  })
  author_id!: string;

  @ManyToOne(() => AccountEntity, {eager: true})
  @JoinColumn({
    name: 'author_id',
    referencedColumnName: 'id'
  })
  author: AccountEntity;
}
