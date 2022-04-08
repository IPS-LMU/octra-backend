import {Column, ColumnOptions, ColumnType} from 'typeorm';
import {Configuration} from '../../config/configuration';
import {ColumnNumericTransformer} from '../transformers';

// mappings from psql to mappings
const mappings = {
  sqlite: {
    'mediumtext': 'text',
    'timestamp': 'datetime',
    'timestamp without time zone': 'datetime',
    'mediumblob': 'blob'
  }
}

const config = Configuration.getInstance();

export function resolveDbType(mySqlType: ColumnType, dbType: string): ColumnType {
  if (mySqlType && mappings.hasOwnProperty(dbType) && mappings[dbType].hasOwnProperty(mySqlType.toString())) {
    return mappings[dbType][mySqlType.toString()];
  }
  return mySqlType;
}

export function DbAwareColumn(columnOptions?: ColumnOptions) {
  const dbType = config.database.dbType;
  if (columnOptions && columnOptions.type && dbType) {
    columnOptions.type = resolveDbType(columnOptions.type, dbType);

    if (columnOptions.type.toString().toLowerCase().indexOf('int') > -1) {
      columnOptions = {
        ...columnOptions,
        transformer: new ColumnNumericTransformer()
      }
    }
  }
  return Column(columnOptions);
}
