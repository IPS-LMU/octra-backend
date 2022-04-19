import {Entity} from 'typeorm';
import {DbAwareColumn} from '../../obj/decorators';
import {StandardEntityWithTimestamps} from '../../obj/entities';

@Entity({name: 'project'})
export class ProjectEntity extends StandardEntityWithTimestamps {
  @DbAwareColumn({
    type: 'text',
    nullable: false
  })
  name: string;
  @DbAwareColumn({
    type: 'text'
  })
  shortname: string;
  @DbAwareColumn({
    type: 'text'
  })
  description: string;
  @DbAwareColumn({
    type: 'json'
  })
  configuration: any;
  @DbAwareColumn({
    type: 'timestamp without time zone'
  })
  startdate: Date;
  @DbAwareColumn({
    type: 'timestamp without time zone'
  })
  enddate: Date;
  @DbAwareColumn({
    type: 'boolean'
  })
  active: boolean;
}
