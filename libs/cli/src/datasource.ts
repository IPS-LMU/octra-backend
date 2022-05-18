import * as Path from "path";
import {dirname} from "path";
import {Configuration, getOrmConfig} from "@octra/server-side";

const config = Configuration.getInstance(dirname(process.execPath));

export const OrmConfig = {
  ...getOrmConfig(config),
  migrationsTableName: "type_orm_migrations",
  migrations: [Path.join(__dirname, "migrations/*.js")],
  cli: {
    "migrationsDir": "src/migrations"
  }
}
export default OrmConfig;
