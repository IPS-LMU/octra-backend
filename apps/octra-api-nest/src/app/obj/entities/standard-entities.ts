import {CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';
import {DbAwareColumn} from '../decorators';

export abstract class StandardEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint'
  })
  id: number;
}

export abstract class StandardEntityWithTimestamps extends StandardEntity {
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
