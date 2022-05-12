import {Entity, JoinColumn, ManyToOne} from 'typeorm';
import {StandardEntityWithTimestamps} from '../../obj/entities';
import {DbAwareColumn} from '../../obj/decorators';
import {AccountEntity} from '../account/entities/account.entity';
import {AudioFileMetaData} from '@octra/octra-api-types';

@Entity({name: 'file'})
export class FileEntity extends StandardEntityWithTimestamps {
  @DbAwareColumn({
    type: 'text',
    nullable: false
  })
  url: string;

  @DbAwareColumn({
    type: 'text',
    nullable: true
  })
  type?: string;

  @DbAwareColumn({
    type: 'bigint',
    nullable: true
  })
  size?: number;

  @DbAwareColumn({
    type: 'bigint',
    nullable: true
  })
  uploader_id?: string;

  @ManyToOne(() => AccountEntity)
  @JoinColumn({
    name: 'uploader_id',
    referencedColumnName: 'id'
  })
  uploader: AccountEntity;

  @DbAwareColumn({
    type: 'bigint',
    nullable: true
  })
  original_name?: string;

  @DbAwareColumn({
    type: 'text',
    nullable: true,
    unique: true
  })
  hash?: string;

  @DbAwareColumn({
    type: 'jsonb',
    nullable: true
  })
  metadata?: AudioFileMetaData;
}
