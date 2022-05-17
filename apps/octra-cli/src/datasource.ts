import * as Path from "path";
import {Configuration} from "./app/core/configuration";

const config = Configuration.getInstance();

export const OrmConfig = {
  type: config.database.dbType,
  host: config.database.dbHost,
  port: config.database.dbPort,
  username: config.database.dbUser,
  password: config.database.dbPassword,
  database: config.database.dbName,
  synchronize: false,
  migrationsTableName: "type_orm_migrations",
  migrations: [Path.join(__dirname, "migrations/*.js")],
  cli: {
    "migrationsDir": "src/migratiosns"
  }
}
export default OrmConfig;
