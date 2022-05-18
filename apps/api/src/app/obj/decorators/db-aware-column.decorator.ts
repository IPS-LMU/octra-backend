import {Column, ColumnOptions, ColumnType} from 'typeorm';
import {ColumnNumericTransformer} from '../transformers';
import {Configuration} from "@octra/server-side";
import {environment} from "../../../environments/environment";
import {dirname} from "path";

// mappings from psql to mappings
const mappings = {
  sqlite: {
    'mediumtext': 'text',
    'timestamp': 'datetime',
    'timestamp without time zone': 'datetime',
    'mediumblob': 'blob',
    'jsonb': 'json'
  }
}

const config = Configuration.getInstance(
  (environment.production) ? dirname(process.execPath) : __dirname
);

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
