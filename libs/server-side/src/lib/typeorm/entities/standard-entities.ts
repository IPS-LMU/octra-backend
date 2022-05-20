import {PrimaryGeneratedColumn} from 'typeorm';
import {DbAwareCreateDate, DbAwareUpdateDate} from '../decorators';

export abstract class StandardEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint'
  })
  id!: string;
}

export abstract class StandardEntityWithTimestamps extends StandardEntity {
  @DbAwareCreateDate()
  creationdate!: Date;

  @DbAwareUpdateDate()
  updatedate!: Date;
}
