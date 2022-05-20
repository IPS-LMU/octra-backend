import {dirname} from 'path';
import {DBPostgresType, SQLTypeMapper} from './sql-type-mapper';
import {Configuration, IAppConfiguration} from '../config';

export class OctraMigration {
  protected sqlMapper: SQLTypeMapper;
  protected config: IAppConfiguration;

  constructor() {
    console.log('load config in octra migration');
    this.config = Configuration.getInstance(dirname(process.execPath));
    this.sqlMapper = new SQLTypeMapper(this.config.database.dbType);
  }

  protected m(postgresType: DBPostgresType) {
    return this.sqlMapper.map(postgresType);
  }
}
