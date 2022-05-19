import {IAppConfiguration} from './configuration';
import * as fs from 'fs';
import {removeNullAttributes} from '../functions';
import {DbNamingStrategy} from '../db-naming.strategy';

export function getOrmConfig(config: IAppConfiguration) {
  let OrmDatabaseConfig: any = {
    type: config.database.dbType,
    host: config.database.dbHost,
    port: config.database.dbPort,
    username: config.database.dbUser,
    password: config.database.dbPassword,
    database: config.database.dbName,
    synchronize: false
  }

  if (config.database.ssl) {
    OrmDatabaseConfig = removeNullAttributes({
      ...OrmDatabaseConfig,
      ssl: {
        rejectUnauthorized: config.database.ssl.rejectUnauthorized,
        ca: config.database.ssl.ca ? fs.readFileSync(config.database.ssl.ca).toString() : undefined,
        key: config.database.ssl.key ? fs.readFileSync(config.database.ssl.key).toString() : undefined,
        cert: config.database.ssl.cert ? fs.readFileSync(config.database.ssl.cert).toString() : undefined
      }
    });
  }

  OrmDatabaseConfig = {
    ...OrmDatabaseConfig,
    namingStrategy: new DbNamingStrategy()
  }

  return OrmDatabaseConfig;
}
