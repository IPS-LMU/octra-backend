import {Entity} from 'typeorm';
import {StandardEntity} from './standard-entities';
import {DbAwareColumn} from '../decorators';

@Entity({name: 'option'})
export class OptionEntity extends StandardEntity {
  @DbAwareColumn({
    type: 'text',
    primary: true,
    unique: true
  })
  name!: string;
  @DbAwareColumn({
    type: 'text',
    nullable: true
  })
  value?: string;
}
