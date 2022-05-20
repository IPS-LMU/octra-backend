import {Entity} from 'typeorm';
import {StandardEntityWithTimestamps} from './standard-entities';
import {DbAwareColumn} from '../decorators';

@Entity({name: 'tool'})
export class ToolEntity extends StandardEntityWithTimestamps {
  @DbAwareColumn({
    type: 'text'
  })
  name!: string;
  @DbAwareColumn({
    type: 'text'
  })
  version!: string;
  @DbAwareColumn({
    type: 'text'
  })
  description!: string;
  @DbAwareColumn({
    type: 'text'
  })
  pid!: string;
}
