import {Entity} from 'typeorm';
import {DbAwareColumn} from '../decorators';
import {StandardEntityWithTimestamps} from './standard-entities';

@Entity({name: 'apptoken'})
export class AppTokenEntity extends StandardEntityWithTimestamps {
  constructor(partial: Partial<AppTokenEntity>) {
    super();
    Object.assign(this, partial);
  }

  @DbAwareColumn({
    type: 'text'
  })
  name!: string;

  @DbAwareColumn({
    type: 'text',
    unique: true
  })
  key!: string;

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
}
