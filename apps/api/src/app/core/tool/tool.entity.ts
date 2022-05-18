import {StandardEntityWithTimestamps} from '../../obj/entities';
import {Entity} from 'typeorm';
import {DbAwareColumn} from '../../obj/decorators';

@Entity({name: 'tool'})
export class ToolEntity extends StandardEntityWithTimestamps {
  @DbAwareColumn({
    type: 'text'
  })
  name: string;
  @DbAwareColumn({
    type: 'text'
  })
  version: string;
  @DbAwareColumn({
    type: 'text'
  })
  description: string;
  @DbAwareColumn({
    type: 'text'
  })
  pid: string;
}
