import {Column, ColumnOptions, CreateDateColumn, UpdateDateColumn} from 'typeorm';
import {SQLTypeMapper} from '../sql-type-mapper';
import {Configuration} from '../../config';
import {applyDecorators} from '@nestjs/common';
import {dateTransformer} from '../transformers';
import {join} from 'path';

function getConfigPath() {
  if (process.env['dev'] && !process.env['configPath']) {
    console.log(`DEV!`);
    return join(__dirname, `../../../`)
  }

  return process.env['configPath'];
}

/*
 first read and initialization of configuration is here
 */
export function DbAwareColumn(columnOptions?: ColumnOptions) {
  const config = Configuration.getInstance(getConfigPath());
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
  const config = Configuration.getInstance(getConfigPath());
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
  const config = Configuration.getInstance(getConfigPath());
  const sqlMapper = new SQLTypeMapper(config.database.dbType);
  return applyDecorators(
    UpdateDateColumn({
      type: sqlMapper.map('timestamp without time zone'),
      onUpdate: 'CURRENT_TIMESTAMP',
      transformer: dateTransformer,
      generated: true
    })
  );
}
