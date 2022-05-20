import {DatabaseType} from 'typeorm';

export type DBPostgresType =
  'mediumtext'
  | 'boolean'
  | 'integer'
  | 'bigint'
  | 'text'
  | 'timestamp'
  | 'timestamp without time zone'
  | 'mediumblob'
  | 'jsonb'
  | 'json';

export class SQLTypeMapper {
  private mappings = {
    sqlite: {
      'mediumtext': 'text',
      'timestamp': 'datetime',
      'timestamp without time zone': 'datetime',
      'mediumblob': 'blob',
      'enum': 'text',
      'json': 'text',
      'jsonb': 'text',
      'integer': 'integer',
      'bigint': 'integer', // we have to use integer because of autoincrement
      'text': 'text',
      'boolean': 'boolean'
    }
  };

  private readonly dbType!: DatabaseType;

  constructor(dbType: DatabaseType) {
    this.dbType = dbType;
  }

  public map(postgresType: DBPostgresType) {
    if (this.dbType !== "postgres") {
      if (Object.keys(this.mappings).indexOf(this.dbType) > -1) {
        return (this.mappings as any)[this.dbType][postgresType];
      } else {
        throw new Error(`Missing key for dbType ${this.dbType}: ${postgresType}`);
      }
    }
    return postgresType;
  }
}
