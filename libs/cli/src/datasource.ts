import * as Path from 'path';
import {dirname} from 'path';
import {Configuration, getOrmConfig} from '@octra/server-side';
import {TypeOrmModuleOptions} from '@nestjs/typeorm';

console.log('load config in datasource cli');
const config = Configuration.getInstance(
  (process.env.configPath) ? process.env.configPath : dirname(process.execPath)
);

export const OrmConfig: TypeOrmModuleOptions = {
  ...getOrmConfig(config),
  driver: (config.database.dbType === 'sqlite') ? require('sqlite3') : undefined,
  entities: ['/snapshot/octra-backend/node_modules/@octra/server-side/src/lib/typeorm/entities/*.js'],
  migrationsTableName: 'typeorm_migrations',
  migrations: [Path.join(__dirname, 'migrations/*.js')],
  cli: {
    'migrationsDir': 'src/migrations'
  }
}
export default OrmConfig;
