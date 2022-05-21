import {Column, ColumnOptions, CreateDateColumn, UpdateDateColumn} from 'typeorm';
import {SQLTypeMapper} from '../sql-type-mapper';
import {Configuration} from '../../config';
import {applyDecorators} from '@nestjs/common';
import {dateTransformer} from '../transformers';

console.log('load config in db aware column');
const config = Configuration.getInstance(process.env['configPath'] as string);


export function DbAwareColumn(columnOptions?: ColumnOptions) {
  const dbType = config.database.dbType;
  const sqlMapper = new SQLTypeMapper(config.database.dbType);
  if (columnOptions && columnOptions.type && dbType) {
    if (!columnOptions?.type) {
      throw new Error(`Missing column type!`);
    }

    const newType = sqlMapper.map(columnOptions.type as any);

    if (!newType) {
      throw new Error(`Invalid column type: ${columnOptions.type}`);
    }

    if (newType.toString().toLowerCase().indexOf('int') > -1) {
      columnOptions = {
        ...columnOptions
      }
    }
    columnOptions.type = newType;
  }
  return Column(columnOptions as any);
}

export function DbAwareCreateDate() {
  const sqlMapper = new SQLTypeMapper(config.database.dbType);
  return applyDecorators(
    CreateDateColumn({
      type: sqlMapper.map('timestamp without time zone'),
      transformer: dateTransformer,
      generated: true
    })
  );
}

export function DbAwareUpdateDate() {
  const sqlMapper = new SQLTypeMapper(config.database.dbType);
  return applyDecorators(
    UpdateDateColumn({
      type: sqlMapper.map('timestamp without time zone'),
      transformer: dateTransformer,
      generated: true
    })
  );
}
