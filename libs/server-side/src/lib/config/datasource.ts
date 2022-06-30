import * as fs from 'fs';
import {removeNullAttributes} from '../functions';
import {IAppConfiguration} from '../types';
import {DbNamingStrategy} from '../typeorm';
import {join} from 'path';
import * as os from 'os';

function getBetterSQLitePath() {
  if (process.env['dev']) {
    if (process.env['test']) {
      return join(__dirname, `../../../../../node_modules/better-sqlite3-multiple-ciphers/build/Release/better_sqlite3-${os.platform()}-${os.arch()}.node`)
    }
    return join(__dirname, `../../../node_modules/better-sqlite3-multiple-ciphers/build/Release/better_sqlite3-${os.platform()}-${os.arch()}.node`)
  }

  return join(__dirname, `../../../../../better-sqlite3-multiple-ciphers/build/Release/better_sqlite3-${os.platform()}-${os.arch()}.node`)
}

export function getOrmConfig(config: IAppConfiguration) {
  let OrmDatabaseConfig: any = {
    type: (config.database.dbType === 'sqlite') ? 'better-sqlite3' : config.database.dbType,
    host: config.database.dbHost,
    port: config.database.dbPort,
    username: config.database.dbUser,
    password: config.database.dbPassword,
    database: config.database.dbName,
    verbose: console.log,
    synchronize: false,
    nativeBinding: (config.database.dbType === 'sqlite') ? getBetterSQLitePath() : undefined
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

  if (config.database.dbType === 'sqlite') {
    OrmDatabaseConfig = {
      ...OrmDatabaseConfig,
      driver: require('better-sqlite3-multiple-ciphers'),
      nativeBinding: getBetterSQLitePath(),
      key: config.database.dbPassword
    }
  }

  OrmDatabaseConfig = {
    ...OrmDatabaseConfig,
    namingStrategy: new DbNamingStrategy()
  }

  return OrmDatabaseConfig;
}
