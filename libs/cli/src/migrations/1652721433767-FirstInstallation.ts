import {MigrationInterface, QueryRunner, Table, TableForeignKey} from 'typeorm';
import {
  AccountEntity,
  AccountPersonEntity,
  AppTokenEntity,
  DBPostgresType,
  getPasswordHash,
  OctraMigration,
  RoleEntity
} from '@octra/server-side';
import {AccountRole, AccountRoleScope} from '@octra/api-types';

export class FirstInstallation1652721433767 extends OctraMigration implements MigrationInterface {
  constructor() {
    super();
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const m = (postgresType: DBPostgresType) => {
      return this.sqlMapper.map(postgresType);
    };

    console.log(`-> Create table "options"...`);
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

    console.log(`-> Create table "tool"...`);
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

    console.log(`-> Create table "role"...`);
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

    await queryRunner.manager.insert(RoleEntity, {
      label: AccountRole.administrator,
      description: 'Administrator with full access to the api.',
      scope: AccountRoleScope.general,
      creationdate: new Date(),
      updatedate: new Date()
    });
    await queryRunner.manager.insert(RoleEntity, {
      label: AccountRole.user,
      description: 'Default role of a registered person',
      scope: AccountRoleScope.general,
      creationdate: new Date(),
      updatedate: new Date()
    });
    await queryRunner.manager.insert(RoleEntity, {
      label: AccountRole.projectAdministrator,
      description: 'Person who organizes a project.',
      scope: AccountRoleScope.project,
      creationdate: new Date(),
      updatedate: new Date()
    });
    await queryRunner.manager.insert(RoleEntity, {
      label: AccountRole.dataDelivery,
      description: 'Person who imports data for new transcriptions.',
      scope: AccountRoleScope.project,
      creationdate: new Date(),
      updatedate: new Date()
    });
    await queryRunner.manager.insert(RoleEntity, {
      label: AccountRole.transcriber,
      description: 'Person who transcribes only.',
      scope: AccountRoleScope.project,
      creationdate: new Date(),
      updatedate: new Date()
    });

    console.log(`-> Create table "account_person"...`);
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

    console.log(`-> Create table "account"...`);
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
          name: 'account_person_id',
          type: m('bigint'),
          isNullable: true
        },
        {
          name: 'role_id',
          type: m('bigint')
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

    console.log(`-> Create table "account_role_project"...`);
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
          name: 'account_id',
          type: m('bigint')
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
        referencedTableName: 'account',
        referencedColumnNames: ['id'],
        columnNames: ['account_id']
      }),
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

    console.log(`-> Create table "file"...`);
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
          name: 'original_name',
          type: m('text'),
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

    console.log(`-> Create table "file_project"...`);
    await queryRunner.createTable(new Table({
      name: 'file_project',
      columns: [
        {
          name: 'id',
          type: m('bigint'),
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment'
        },
        {
          name: 'file_id',
          type: m('bigint')
        },
        {
          name: 'project_id',
          type: m('bigint'),
          isNullable: true
        },
        {
          name: 'virtual_folder_path',
          type: m('text'),
          isNullable: true
        },
        {
          name: 'virtual_filename',
          type: m('text'),
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

    await queryRunner.createForeignKeys('file_project', [
      new TableForeignKey({
        referencedTableName: 'file',
        referencedColumnNames: ['id'],
        columnNames: ['file_id']
      }),
      new TableForeignKey({
        referencedTableName: 'project',
        referencedColumnNames: ['id'],
        columnNames: ['project_id']
      })
    ]);

    console.log(`-> Create table "apptoken"...`);
    await queryRunner.createTable(new Table({
      name: 'apptoken',
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
          name: 'key',
          type: m('text')
        },
        {
          name: 'domain',
          type: m('text'),
          isNullable: true
        },
        {
          name: 'description',
          type: m('text'),
          isNullable: true
        },
        {
          name: 'registrations',
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

    console.log(`-> Create table "task"...`);
    await queryRunner.createTable(new Table({
      name: 'task',
      columns: [
        {
          name: 'id',
          type: m('bigint'),
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment'
        },
        {
          name: 'type',
          type: m('text'),
          isNullable: true
        },
        {
          name: 'pid',
          type: m('text'),
          isNullable: true
        },
        {
          name: 'orgtext',
          type: m('text'),
          isNullable: true
        },
        {
          name: 'assessment',
          type: m('text'),
          isNullable: true
        },
        {
          name: 'priority',
          type: m('integer'),
          default: 0,
          isNullable: true
        },
        {
          name: 'status',
          type: m('text'),
          isNullable: true
        },
        {
          name: 'code',
          type: m('text'),
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
          name: 'log',
          type: m('json'),
          isNullable: true
        },
        {
          name: 'comment',
          type: m('text'),
          isNullable: true
        },
        {
          name: 'tool_id',
          type: m('bigint'),
          isNullable: true
        },
        {
          name: 'project_id',
          type: m('bigint'),
          isNullable: true
        },
        {
          name: 'worker_id',
          type: m('bigint'),
          isNullable: true
        },
        {
          name: 'nexttask_id',
          type: m('bigint'),
          isNullable: true
        },
        {
          name: 'admin_comment',
          type: m('bigint'),
          isNullable: true
        },
        {
          name: 'creationdate',
          type: m('timestamp without time zone'),
          isNullable: true
        },
        {
          name: 'updatedate',
          type: m('timestamp without time zone'),
          isNullable: true
        }
      ]
    }));

    console.log(`-> Create task_input_output "task"...`);
    await queryRunner.createTable(new Table({
      name: 'task_input_output',
      columns: [
        {
          name: 'id',
          type: m('bigint'),
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment'
        },
        {
          name: 'task_id',
          type: m('bigint')
        },
        {
          name: 'file_project_id',
          type: m('bigint'),
          isNullable: true
        },
        {
          name: 'type',
          type: m('text'),
        },
        {
          name: 'creator_type',
          type: m('text'),
        },
        {
          name: 'label',
          type: m('text'),
        },
        {
          name: 'description',
          type: m('text'),
          isNullable: true
        },
        {
          name: 'filename',
          type: m('text'),
          isNullable: true
        },
        {
          name: 'url',
          type: m('text'),
          isNullable: true
        },
        {
          name: 'content',
          type: m('json'),
          isNullable: true
        }
      ]
    }));

    await queryRunner.createForeignKeys('task_input_output', [
      new TableForeignKey({
        referencedTableName: 'task',
        referencedColumnNames: ['id'],
        columnNames: ['task_id']
      }),
      new TableForeignKey({
        referencedTableName: 'file_project',
        referencedColumnNames: ['id'],
        columnNames: ['file_project_id']
      })
    ]);

    await queryRunner.createForeignKeys('task', [
      new TableForeignKey({
        referencedTableName: 'tool',
        referencedColumnNames: ['id'],
        columnNames: ['tool_id']
      }),
      new TableForeignKey({
        referencedTableName: 'project',
        referencedColumnNames: ['id'],
        columnNames: ['project_id']
      }),
      new TableForeignKey({
        referencedTableName: 'account',
        referencedColumnNames: ['id'],
        columnNames: ['worker_id']
      }),
      new TableForeignKey({
        referencedTableName: 'task',
        referencedColumnNames: ['id'],
        columnNames: ['nexttask_id']
      })
    ]);

    console.log(`-> Create first apptoken: a810c2e6e76774fadf03d8edd1fc9d1954cc27d6`);
    await queryRunner.manager.insert(AppTokenEntity, {
      name: 'dev token',
      key: 'a810c2e6e76774fadf03d8edd1fc9d1954cc27d6',
      domain: 'localhost',
      description: 'apptoken for testing',
      registrations: false,
      creationdate: new Date(),
      updatedate: new Date()
    });

    console.log(`-> Create first administrator with username="Julian" and password="Test123"`);
    const insertResult = await queryRunner.manager.insert(AccountPersonEntity, {
      username: 'Julian',
      email: 'j.poemp@campus.lmu.de',
      loginmethod: 'local',
      hash: getPasswordHash(this.config.api.passwordSalt, 'Test123'),
      active: true
    });
    await queryRunner.manager.insert(AccountEntity, {
      training: '',
      comment: '',
      account_person_id: insertResult.identifiers[0].id,
      role_id: '1',
      last_login: new Date(),
      creationdate: new Date(),
      updatedate: new Date(),
    })
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }

}
