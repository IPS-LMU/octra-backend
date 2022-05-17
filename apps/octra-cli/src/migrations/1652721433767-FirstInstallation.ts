import {MigrationInterface, QueryRunner, Table} from "typeorm";
import {Configuration, IAppConfiguration} from "../app/core/configuration";

export class FirstInstallation1652721433767 implements MigrationInterface {
  private config: IAppConfiguration;

  constructor() {
    this.config = Configuration.getInstance();
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: "option",
      columns: [
        {
          name: "id",
          type: (this.config.database.dbType === "postgres") ? "bigint" : "integer",
          isPrimary: true,
          isGenerated: true,
          generationStrategy: "increment"
        },
        {
          name: "name",
          type: "text",
          isNullable: false,
          isUnique: true
        },
        {
          name: "value",
          type: "text"
        }
      ]
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }

}
