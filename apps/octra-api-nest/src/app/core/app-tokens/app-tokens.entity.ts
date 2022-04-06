import {CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';
import {DbAwareColumn} from '../../db-aware-column.decorator';

@Entity({name: 'apptoken'})
export class AppToken {
  @PrimaryGeneratedColumn({
    type: 'bigint'
  })
  id: number;

  @DbAwareColumn({
    type: 'text'
  })
  name: string;

  @DbAwareColumn({
    type: 'text',
    unique: true
  })
  key: string;

  @DbAwareColumn({
    type: 'text',
    nullable: true
  })
  domain?: string;

  @DbAwareColumn({
    type: 'text',
    nullable: true
  })
  description?: string;

  @DbAwareColumn({
    type: 'boolean',
    default: false
  })
  registrations?: boolean;

  @DbAwareColumn({
    type: 'timestamp without time zone'
  })
  @CreateDateColumn()
  creationdate: Date;

  @DbAwareColumn({
    type: 'timestamp without time zone'
  })
  @UpdateDateColumn()
  updatedate: Date;
}