import {DBPostgresType, SQLTypeMapper} from './sql-type-mapper';
import {Configuration} from '../config';
import {IAppConfiguration} from '../types';

export class OctraMigration {
  protected sqlMapper: SQLTypeMapper;
  protected config: IAppConfiguration;

  constructor() {
    this.config = Configuration.getInstance(process.env['configPath']);
    this.sqlMapper = new SQLTypeMapper(this.config.database.dbType);
  }

  protected m(postgresType: DBPostgresType) {
    return this.sqlMapper.map(postgresType);
  }
}
