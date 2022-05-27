import {Configuration, DBPostgresType, IAppConfiguration, SQLTypeMapper} from '@octra/server-side';

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
