import {MigrationInterface, QueryRunner, Table, TableForeignKey} from 'typeorm';
import {
  AccountCategorySelection,
  AccountEntity,
  AccountFieldCheckboxes,
  AccountFieldDefinitionEntity,
  AccountFieldTextArea,
  AccountPersonEntity,
  AppTokenEntity,
  DBPostgresType,
  generateLanguageOptions,
  getPasswordHash,
  getRandomString,
  OptionEntity,
  RoleEntity
} from '@octra/server-side';
import {
  AccountFieldContext,
  AccountFieldDefinitionType,
  AccountPersonGender,
  AccountRole,
  AccountRoleScope
} from '@octra/api-types';
import {OctraMigration} from '../octra-migration';

export class FirstInstallation1652721433767 extends OctraMigration implements MigrationInterface {
  constructor() {
    super();
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!process.env['ADMIN_NAME'] || !process.env['ADMIN_MAIL'] || !process.env['ADMIN_PW']) {
      throw new Error('Missing credentials for new administrator account.');
    }

    const m = (postgresType: DBPostgresType) => {
      return this.sqlMapper.map(postgresType);
    };

    console.log(`-> Create table "option"...`);
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
    }), true);

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
          default: 'CURRENT_TIMESTAMP',
          type: m('timestamp without time zone')
        },
        {
          name: 'updatedate',
          type: m('timestamp without time zone'),
          default: 'CURRENT_TIMESTAMP',
          onUpdate: 'CURRENT_TIMESTAMP'
        }
      ]
    }), true);

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
          default: 'CURRENT_TIMESTAMP',
          type: m('timestamp without time zone')
        },
        {
          name: 'updatedate',
          type: m('timestamp without time zone'),
          default: 'CURRENT_TIMESTAMP',
          onUpdate: 'CURRENT_TIMESTAMP'
        }
      ]
    }), true);

    console.log('--> Insert role entries...')
    await queryRunner.manager.insert(RoleEntity, {
      label: AccountRole.administrator,
      description: 'Administrator with full access to the api.',
      scope: AccountRoleScope.general
    });
    await queryRunner.manager.insert(RoleEntity, {
      label: AccountRole.user,
      description: 'Default role of a registered person',
      scope: AccountRoleScope.general
    });
    await queryRunner.manager.insert(RoleEntity, {
      label: AccountRole.projectAdministrator,
      description: 'Person who organizes a project.',
      scope: AccountRoleScope.project
    });
    await queryRunner.manager.insert(RoleEntity, {
      label: AccountRole.dataDelivery,
      description: 'Person who imports data for new transcriptions.',
      scope: AccountRoleScope.project
    });
    await queryRunner.manager.insert(RoleEntity, {
      label: AccountRole.transcriber,
      description: 'Person who transcribes only.',
      scope: AccountRoleScope.project
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
          name: 'gender',
          type: m('text')
        },
        {
          name: 'first_name',
          type: m('text')
        },
        {
          name: 'last_name',
          type: m('text')
        },
        {
          name: 'organization',
          isNullable: true,
          type: m('text')
        },
        {
          name: 'birthday',
          isNullable: true,
          type: m('timestamp without time zone')
        },
        {
          name: 'street',
          isNullable: true,
          type: m('text')
        },
        {
          name: 'street_number',
          isNullable: true,
          type: m('text')
        },
        {
          name: 'phone',
          isNullable: true,
          type: m('text')
        },
        {
          name: 'town',
          isNullable: true,
          type: m('text')
        },
        {
          name: 'postcode',
          isNullable: true,
          type: m('text')
        },
        {
          name: 'state',
          isNullable: true,
          type: m('text')
        },
        {
          name: 'country',
          isNullable: true,
          type: m('text')
        },
        {
          name: 'active',
          type: m('boolean'),
          default: true
        }
      ]
    }), true);

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
          default: 'CURRENT_TIMESTAMP',
          type: m('timestamp without time zone'),
        },
        {
          name: 'updatedate',
          type: m('timestamp without time zone'),
          default: 'CURRENT_TIMESTAMP',
          onUpdate: 'CURRENT_TIMESTAMP'
        }
      ]
    }), true);

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

    console.log(`-> Create table "policy"...`);
    await queryRunner.createTable(new Table({
      name: 'policy',
      columns: [
        {
          name: 'id',
          type: m('integer'),
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment'
        },
        {
          name: 'type',
          type: m('text'),
        },
        {
          name: 'version',
          type: m('integer')
        },
        {
          name: 'publishdate',
          isNullable: true,
          type: m('timestamp without time zone')
        },
        {
          name: 'creationdate',
          default: 'CURRENT_TIMESTAMP',
          type: m('timestamp without time zone')
        },
      ]
    }), true);

    console.log(`-> Create table "policy_translation"...`);
    await queryRunner.createTable(new Table({
      name: 'policy_translation',
      columns: [
        {
          name: 'id',
          type: m('integer'),
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment'
        },
        {
          name: 'policy_id',
          type: m('integer'),
        },
        {
          name: 'language',
          type: m('text')
        },
        {
          name: 'url',
          type: m('text'),
          isNullable: true
        },
        {
          name: 'text',
          type: m('text'),
          isNullable: true
        },
        {
          name: 'author_id',
          type: m('bigint')
        },
        {
          name: 'creationdate',
          default: 'CURRENT_TIMESTAMP',
          type: m('timestamp without time zone')
        },
        {
          name: 'updatedate',
          type: m('timestamp without time zone'),
          default: 'CURRENT_TIMESTAMP',
          onUpdate: 'CURRENT_TIMESTAMP'
        }
      ]
    }), true);

    await queryRunner.createForeignKeys('policy_translation', [
      new TableForeignKey({
        referencedTableName: 'account',
        referencedColumnNames: ['id'],
        columnNames: ['author_id']
      }),
      new TableForeignKey({
        referencedTableName: 'policy',
        referencedColumnNames: ['id'],
        columnNames: ['policy_id']
      })
    ]);

    console.log(`-> Create table "policy_account_consent"...`);
    await queryRunner.createTable(new Table({
      name: 'policy_account_consent',
      columns: [
        {
          name: 'id',
          type: m('bigint'),
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment'
        },
        {
          name: 'policy_id',
          type: m('integer'),
        },
        {
          name: 'account_id',
          type: m('bigint')
        },
        {
          name: 'consentdate',
          default: 'CURRENT_TIMESTAMP',
          type: m('timestamp without time zone')
        },
      ]
    }), true);

    await queryRunner.createForeignKeys('policy_account_consent', [
      new TableForeignKey({
        referencedTableName: 'policy',
        referencedColumnNames: ['id'],
        columnNames: ['policy_id']
      }),
      new TableForeignKey({
        referencedTableName: 'account',
        referencedColumnNames: ['id'],
        columnNames: ['account_id']
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
          name: 'visibility',
          type: m('text'),
          isNullable: false
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
          default: 'CURRENT_TIMESTAMP',
          type: m('timestamp without time zone'),
        },
        {
          name: 'updatedate',
          type: m('timestamp without time zone'),
          default: 'CURRENT_TIMESTAMP',
          onUpdate: 'CURRENT_TIMESTAMP'
        }
      ]
    }), true);

    console.log(`-> Create table "account_field_definition"...`);
    await queryRunner.createTable(new Table({
      name: 'account_field_definition',
      columns: [
        {
          name: 'id',
          type: m('bigint'),
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment'
        },
        {
          name: 'context',
          type: m('text'),
        },
        {
          name: 'name',
          isUnique: true,
          type: m('text'),
        },
        {
          name: 'definition',
          type: m('jsonb')
        },
        {
          name: 'type',
          type: m('text')
        },
        {
          name: 'remove_value_on_account_delete',
          type: m('boolean'),
          default: false
        },
        {
          name: 'removable',
          type: m('boolean'),
          default: true
        },
        {
          name: 'active',
          type: m('boolean'),
          default: true
        },
        {
          name: 'sort_order',
          type: m('integer'),
          default: -1
        }
      ]
    }), true);

    await queryRunner.manager.insert(AccountFieldDefinitionEntity, {
      context: AccountFieldContext.project,
      name: 'comment',
      definition: new AccountFieldTextArea({
        schema: {
          label: [
            {
              language: 'de',
              value: 'Kommentar'
            },
            {
              language: 'en',
              value: 'Comment'
            }
          ],
          placeholder: [
            {
              language: 'de',
              value: 'Kommentar'
            },
            {
              language: 'en',
              value: 'Comment'
            }
          ]
        }
      }),
      type: AccountFieldDefinitionType.longtext,
      remove_value_on_account_delete: true,
      removable: false,
      sort_order: 0
    });

    await queryRunner.manager.insert(AccountFieldDefinitionEntity, {
      context: AccountFieldContext.account,
      name: 'language_skills',
      definition: new AccountCategorySelection({
        multipleResults: true,
        schema: {
          label: [
            {
              language: 'en',
              value: 'Language skills'
            },
            {
                language: 'de',
                value: 'Sprachkenntnisse'
              }
            ],
            selections: [
              {
                name: 'language',
                options: generateLanguageOptions()
              }
            ]
          }
        }),
        type: AccountFieldDefinitionType.category_selection,
        remove_value_on_account_delete: false,
        removable: false,
        sort_order: 0
      }
    );

    await queryRunner.manager.insert(AccountFieldDefinitionEntity, {
        context: AccountFieldContext.account,
        name: 'transcription_skills',
        definition: new AccountFieldCheckboxes({
          schema: {
            label: [
              {
                language: 'en',
                value: 'Transcription skills'
              },
              {
                language: 'de',
                value: 'Transkriptionserfahrungen'
              }
            ],
            arrangement: 'horizontal',
            options: [
              {
                label: [
                  {
                    language: 'en',
                    value: 'Orthographic transcription'
                  },
                  {
                    language: 'de',
                    value: 'Orthografische Transkription'
                  }
                ],
                value: 'orthographic'
              },
              {
                label: [
                  {
                    language: 'en',
                    value: 'Phonetic transcription'
                  },
                  {
                    language: 'de',
                    value: 'Phonetische Transkription'
                  }
                ],
                value: 'phonetic'
              }
            ]
          }
        }),
        type: AccountFieldDefinitionType.multiple_choice,
        remove_value_on_account_delete: false,
        removable: false,
        sort_order: 1
      }
    );

    console.log(`-> Create table "account_field_value"...`);
    await queryRunner.createTable(new Table({
      name: 'account_field_value',
      columns: [
        {
          name: 'id',
          type: m('bigint'),
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment'
        },
        {
          name: 'account_field_definition_id',
          type: m('bigint'),
        },
        {
          name: 'account_id',
          type: m('bigint'),
        },
        {
          name: 'project_id',
          type: m('bigint'),
          isNullable: true
        },
        {
          name: 'value',
          type: m('text')
        }
      ]
    }), true);

    await queryRunner.createForeignKeys('account_field_value', [
      new TableForeignKey({
        referencedTableName: 'account',
        referencedColumnNames: ['id'],
        columnNames: ['account_id']
      }),
      new TableForeignKey({
        referencedTableName: 'project',
        referencedColumnNames: ['id'],
        columnNames: ['project_id']
      }),
      new TableForeignKey({
        referencedTableName: 'account_field_definition',
        referencedColumnNames: ['id'],
        columnNames: ['account_field_definition_id']
      })
    ]);


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
          default: 'CURRENT_TIMESTAMP',
          type: m('timestamp without time zone'),
        },
        {
          name: 'updatedate',
          type: m('timestamp without time zone'),
          default: 'CURRENT_TIMESTAMP',
          onUpdate: 'CURRENT_TIMESTAMP'
        }
      ]
    }), true);

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
          name: 'project_id',
          type: m('bigint'),
          isUnique: false
        },
        {
          name: 'uploader_id',
          type: m('bigint')
        },
        {
          name: 'real_name',
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
          name: 'path',
          type: m('text'),
          isNullable: true
        },
        {
          name: 'url',
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
          default: 'CURRENT_TIMESTAMP',
          type: m('timestamp without time zone'),
        },
        {
          name: 'updatedate',
          type: m('timestamp without time zone'),
          default: 'CURRENT_TIMESTAMP',
          onUpdate: 'CURRENT_TIMESTAMP'
        }
      ]
    }), true);

    await queryRunner.createForeignKeys('file_project', [
      new TableForeignKey({
        referencedTableName: 'project',
        referencedColumnNames: ['id'],
        columnNames: ['project_id']
      }),
      new TableForeignKey({
        referencedTableName: 'account',
        referencedColumnNames: ['id'],
        columnNames: ['uploader_id']
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
          default: 'CURRENT_TIMESTAMP',
          type: m('timestamp without time zone'),
        },
        {
          name: 'updatedate',
          type: m('timestamp without time zone'),
          default: 'CURRENT_TIMESTAMP',
          onUpdate: 'CURRENT_TIMESTAMP'
        }
      ]
    }), true);

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
          default: 'CURRENT_TIMESTAMP',
          type: m('timestamp without time zone')
        },
        {
          name: 'updatedate',
          type: m('timestamp without time zone'),
          default: 'CURRENT_TIMESTAMP',
          onUpdate: 'CURRENT_TIMESTAMP'
        }
      ]
    }), true);

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
    }), true);

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

    console.log(`-> Create first app token...`);
    await queryRunner.manager.insert(AppTokenEntity, {
      name: 'first token',
      key: getRandomString(30),
      domain: 'localhost',
      description: 'First App Token',
      registrations: false
    });

    const domainMatches = (this.config.api.plugins?.webBackend?.url) ? /(?:https?:\/\/)?(?:www\.)?([^/]+)/g.exec(this.config.api.plugins.webBackend.url) : [];
    if (domainMatches.length > 1 && this.config.api.plugins?.webBackend?.appToken) {
      console.log(`-> Create app token for webbackend...`);
      await queryRunner.manager.insert(AppTokenEntity, {
        name: 'Web Backend',
        key: this.config.api.plugins?.webBackend?.appToken,
        domain: domainMatches[1],
        description: 'Apptoken for the web-backend',
        registrations: false
      });
    }

    const admin_name = process.env['ADMIN_NAME'];
    const password = process.env['ADMIN_PW'];

    console.log(`-> Create first administrator..."`);
    const insertResult = await queryRunner.manager.insert(AccountPersonEntity, {
      username: admin_name,
      gender: AccountPersonGender.male,
      first_name: 'Standard',
      last_name: 'Admin',
      postcode: '12345',
      state: 'Bavaria',
      country: 'Germany',
      email: process.env['ADMIN_MAIL'],
      loginmethod: 'local',
      hash: getPasswordHash(this.config.api.security.keys.password.salt, password),
      active: true
    });
    await queryRunner.manager.insert(AccountEntity, {
      comment: '',
      account_person_id: insertResult.identifiers[0].id,
      role_id: '1',
      last_login: new Date()
    });
    await queryRunner.manager.insert(OptionEntity, {
      name: 'db_version',
      value: '1.0.0'
    });
    await queryRunner.manager.insert(OptionEntity, {
      name: 'mail_support_address',
      value: process.env['ADMIN_MAIL']
    });
    await queryRunner.manager.insert(OptionEntity, {
      name: 'data_policy_urls',
      value: null
    });
    await queryRunner.manager.insert(OptionEntity, {
      name: 'terms_conditions_urls',
      value: null
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }
}
