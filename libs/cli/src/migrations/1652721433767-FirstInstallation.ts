import {MigrationInterface, QueryRunner, Table} from "typeorm";
import {Configuration, DBPostgresType, OctraMigration} from "@octra/server-side";
import {dirname} from "path";

export class FirstInstallation1652721433767 extends OctraMigration implements MigrationInterface {
  constructor() {
    super();
    this.config = Configuration.getInstance(dirname(process.execPath));
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const m = (postgresType: DBPostgresType) => {
      return this.sqlMapper.map(postgresType);
    };

    await queryRunner.createTable(new Table({
      name: "option",
      columns: [
        {
          name: "id",
          type: m("bigint"),
          isPrimary: true,
          isGenerated: true,
          generationStrategy: "increment"
        },
        {
          name: "name",
          type: m("text"),
          isUnique: true
        },
        {
          name: "value",
          isNullable: true,
          type: m("text")
        }
      ]
    }));

    await queryRunner.createTable(new Table({
      name: "tool",
      columns: [
        {
          name: "id",
          type: m("integer"),
          isPrimary: true,
          isGenerated: true,
          generationStrategy: "increment"
        },
        {
          name: "name",
          type: m("text"),
          isUnique: true
        },
        {
          name: "version",
          isNullable: true,
          type: m("text")
        },
        {
          name: "description",
          isNullable: true,
          type: m("text")
        },
        {
          name: "pid",
          isNullable: true,
          type: m("text")
        },
        {
          name: "creationdate",
          type: m("timestamp without time zone")
        },
        {
          name: "updatedate",
          type: m("timestamp without time zone")
        }
      ]
    }));

    await queryRunner.createTable(new Table({
      name: "role",
      columns: [
        {
          name: "id",
          type: m("integer"),
          isPrimary: true,
          isGenerated: true,
          generationStrategy: "increment"
        },
        {
          name: "label",
          type: m("text"),
          isNullable: true
        },
        {
          name: "description",
          type: m("text"),
          isNullable: true
        },
        {
          name: "scope",
          type: m("text")
        },
        {
          name: "creationdate",
          type: m("timestamp without time zone")
        },
        {
          name: "updatedate",
          type: m("timestamp without time zone")
        }
      ]
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }

}
