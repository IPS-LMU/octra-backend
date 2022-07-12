import {Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {DbAwareColumn, DbAwareCreateDate} from '../decorators';
import {AccountEntity} from '@octra/server-side';

@Entity({name: 'policy'})
export class PolicyEntity {
  @PrimaryGeneratedColumn({
    type: 'integer'
  })
  id: number;
  @DbAwareColumn({
    type: 'text'
  })
  type!: string;
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
    type: 'integer'
  })
  version!: number;

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
    type: 'integer'
  })
  id!: string;

  @DbAwareColumn({
    type: 'integer'
  })
  policy_id!: string;

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
