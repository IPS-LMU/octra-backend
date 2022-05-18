import {Configuration, DBPostgresType, IAppConfiguration, SQLTypeMapper} from "@octra/server-side";
import {dirname} from "path";

export class OctraMigration {
  protected sqlMapper: SQLTypeMapper;
  protected config: IAppConfiguration;

  constructor() {
    this.config = Configuration.getInstance(dirname(process.execPath));
    this.sqlMapper = new SQLTypeMapper(this.config.database.dbType);
  }

  protected m(postgresType: DBPostgresType) {
    return this.sqlMapper.map(postgresType);
  }
}
