import {MigrationInterface, QueryRunner, Table, TableForeignKey} from 'typeorm';
import {Configuration, DBPostgresType, OctraMigration} from '@octra/server-side';
import {dirname} from 'path';

export class FirstInstallation1652721433767 extends OctraMigration implements MigrationInterface {
  constructor() {
    super();
    this.config = Configuration.getInstance(dirname(process.execPath));
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const m = (postgresType: DBPostgresType) => {
      return this.sqlMapper.map(postgresType);
    };

    // create option table
    await queryRunner.createTable(new Table({
      name: 'option',
      columns: [
        {
          name: 'id',
          type: m('bigint'),
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment'
        },
        {
          name: 'name',
          type: m('text'),
          isUnique: true
        },
        {
          name: 'value',
          isNullable: true,
          type: m('text')
        }
      ]
    }));

    // create tool table
    await queryRunner.createTable(new Table({
      name: 'tool',
      columns: [
        {
          name: 'id',
          type: m('integer'),
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment'
        },
        {
          name: 'name',
          type: m('text'),
          isUnique: true
        },
        {
          name: 'version',
          isNullable: true,
          type: m('text')
        },
        {
          name: 'description',
          isNullable: true,
          type: m('text')
        },
        {
          name: 'pid',
          isNullable: true,
          type: m('text')
        },
        {
          name: 'creationdate',
          type: m('timestamp without time zone')
        },
        {
          name: 'updatedate',
          type: m('timestamp without time zone')
        }
      ]
    }));

    // create role table
    await queryRunner.createTable(new Table({
      name: 'role',
      columns: [
        {
          name: 'id',
          type: m('integer'),
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment'
        },
        {
          name: 'label',
          type: m('text'),
          isNullable: true
        },
        {
          name: 'description',
          type: m('text'),
          isNullable: true
        },
        {
          name: 'scope',
          type: m('text')
        },
        {
          name: 'creationdate',
          type: m('timestamp without time zone')
        },
        {
          name: 'updatedate',
          type: m('timestamp without time zone')
        }
      ]
    }));

    // create account_person table
    await queryRunner.createTable(new Table({
      name: 'account_person',
      columns: [
        {
          name: 'id',
          type: m('bigint'),
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment'
        },
        {
          name: 'username',
          type: m('text')
        },
        {
          name: 'email',
          type: m('text'),
          isNullable: true
        },
        {
          name: 'loginmethod',
          type: m('text')
        },
        {
          name: 'hash',
          type: m('text')
        },
        {
          name: 'active',
          type: m('boolean'),
          default: true
        }
      ]
    }));

    // create account table
    await queryRunner.createTable(new Table({
      name: 'account',
      columns: [
        {
          name: 'id',
          type: m('bigint'),
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment'
        },
        {
          name: 'training',
          type: m('text'),
          isNullable: true
        },
        {
          name: 'comment',
          type: m('text'),
          isNullable: true
        },
        {
          name: 'account_person_id',
          type: m('bigint'),
          isNullable: true
        },
        {
          name: 'role_id',
          type: m('bigint')
        },
        {
          name: 'last_login',
          type: m('timestamp without time zone'),
        },
        {
          name: 'creationdate',
          type: m('timestamp without time zone'),
        },
        {
          name: 'updatedate',
          type: m('timestamp without time zone'),
        }
      ]
    }));

    await queryRunner.createForeignKeys('account', [
      new TableForeignKey({
        referencedTableName: 'role',
        referencedColumnNames: ['id'],
        columnNames: ['role_id']
      }),
      new TableForeignKey({
        referencedTableName: 'account_person',
        referencedColumnNames: ['id'],
        columnNames: ['account_person_id'],
        onDelete: 'set null'
      })
    ]);


    // create project table
    await queryRunner.createTable(new Table({
      name: 'project',
      columns: [
        {
          name: 'id',
          type: m('bigint'),
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment'
        },
        {
          name: 'name',
          type: m('text')
        },
        {
          name: 'shortname',
          type: m('text'),
          isNullable: true
        },
        {
          name: 'description',
          type: m('text'),
          isNullable: true
        },
        {
          name: 'configuration',
          type: m('json'),
          isNullable: true
        },
        {
          name: 'startdate',
          type: m('timestamp without time zone'),
          isNullable: true
        },
        {
          name: 'enddate',
          type: m('timestamp without time zone'),
          isNullable: true
        },
        {
          name: 'active',
          type: m('boolean'),
          default: false
        },
        {
          name: 'creationdate',
          type: m('timestamp without time zone'),
        },
        {
          name: 'updatedate',
          type: m('timestamp without time zone'),
        }
      ]
    }));

    // create account_role_project table
    await queryRunner.createTable(new Table({
      name: 'account_role_project',
      columns: [
        {
          name: 'id',
          type: m('bigint'),
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment'
        },
        {
          name: 'role_id',
          type: m('bigint')
        },
        {
          name: 'project_id',
          type: m('bigint')
        },
        {
          name: 'valid_startdate',
          type: m('timestamp without time zone'),
          isNullable: true
        },
        {
          name: 'valid_enddate',
          type: m('timestamp without time zone'),
          isNullable: true
        },
        {
          name: 'creationdate',
          type: m('timestamp without time zone'),
        },
        {
          name: 'updatedate',
          type: m('timestamp without time zone'),
        }
      ]
    }));

    await queryRunner.createForeignKeys('account_role_project', [
      new TableForeignKey({
        referencedTableName: 'role',
        referencedColumnNames: ['id'],
        columnNames: ['role_id']
      }),
      new TableForeignKey({
        referencedTableName: 'project',
        referencedColumnNames: ['id'],
        columnNames: ['project_id']
      })
    ]);

    // create file table
    await queryRunner.createTable(new Table({
      name: 'file',
      columns: [
        {
          name: 'id',
          type: m('bigint'),
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment'
        },
        {
          name: 'url',
          type: m('text')
        },
        {
          name: 'type',
          type: m('text'),
          isNullable: true
        },
        {
          name: 'size',
          type: m('bigint'),
          isNullable: true
        },
        {
          name: 'uploader_id',
          type: m('bigint'),
          isNullable: true
        },
        {
          name: 'hash',
          type: m('text'),
          isNullable: true
        },
        {
          name: 'metadata',
          type: m('jsonb'),
          isNullable: true
        },
        {
          name: 'creationdate',
          type: m('timestamp without time zone'),
        },
        {
          name: 'updatedate',
          type: m('timestamp without time zone'),
        }
      ]
    }));

    await queryRunner.createForeignKeys('file', [
      new TableForeignKey({
        referencedTableName: 'account',
        referencedColumnNames: ['id'],
        columnNames: ['uploader_id']
      })
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }

}
