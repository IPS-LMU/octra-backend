import * as Path from 'path';
import {Configuration, getOrmConfig} from '@octra/server-side';
import {SqlServerConnectionOptions} from 'typeorm/driver/sqlserver/SqlServerConnectionOptions';
import {DataSource} from 'typeorm';

const config = Configuration.getInstance(); // config is intitialized in dbaware decorator

export const OrmConfig: SqlServerConnectionOptions = {
  ...getOrmConfig(config),
  driver: (config.database.dbType === 'sqlite') ? require('sqlite3') : undefined,
  entities: [
    '/snapshot/octra-backend/node_modules/@octra/server-side/src/lib/typeorm/entities/*.js'
  ],
  migrationsTableName: 'typeorm_migrations',
  migrations: [Path.join(__dirname, 'migrations/*.js')],
  cli: {
    'migrationsDir': 'src/migrations'
  },
  logging: 'error',
  logger: 'advanced-console'
}
export default new DataSource(OrmConfig);
