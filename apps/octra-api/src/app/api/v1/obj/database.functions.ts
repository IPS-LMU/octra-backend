import {AppConfiguration} from '../../../obj/app-config/app-config';
import {randomBytes} from 'crypto';
import {
  AddFileProjectRequest,
  AddFileRequest,
  AddToolRequest,
  AppTokensRow,
  AssignProjectUserRolesRequestItem,
  AssignUserRoleRequest,
  ChangeProjectRequest,
  CreateProjectRequest,
  DeliverNewMediaRequest,
  FileRow,
  OCTRASQLStatements,
  PreparedAccountRow,
  PreparedFileProjectRow,
  PreparedProjectRow,
  PreparedTaskRow,
  ProjectResponseDataItem,
  ProjectRow,
  ProjectTranscriptsChangeStatusRequestItem,
  RemoveProjectRequest,
  RolesRow,
  SaveAnnotationRequest,
  StartAnnotationRequest,
  TaskInputOutputRow,
  TaskProperties,
  TaskStatus,
  ToolRow,
  UserInfoResponseDataItem,
  UserRole,
  UserRoleScope
} from '@octra/db';
import {SHA256} from 'crypto-js';
import {DBManager, ParameterizedQuery, SQLQuery} from '../../../db/db.manager';
import {TokenData} from './types';
import {DateTime} from 'luxon';
import {PathBuilder} from '../path-builder';
import {isNumber} from '../../../obj/functions';

export class DatabaseFunctions {
  private static dbManager: DBManager;
  private static settings: AppConfiguration;
  private static pathBuilder: PathBuilder;

  /*
  private static selectAllStatements = {
    appToken: 'select id::integer, name::text, key::text, domain::text, description::text, registrations::boolean from apptoken',
    account: 'select ac.id::integer, ac.username::text, ac.email::text, ac.loginmethod::text, ac.active::boolean, ac.hash::text, ac.training::text, ac.comment::text, ac.createdate::timestamp from account ac',
    project: 'select id::integer, name::text, shortname::text, description::text, configuration::text, startdate::timestamp, enddate::timestamp, active::boolean from project',
    mediaitem: 'select id::integer, url::text, type::text, size::integer, metadata::text from mediaitem',
    tool: 'select id::integer, name::text, version::text, description::text, pid::text from tool',
    transcript: 'select id::integer, pid::text, orgtext::text, transcript::text, assessment::text, priority::integer, status::text, code::text, creationdate::timestamp, startdate::timestamp, enddate::timestamp, log::text, comment::text, tool_id::integer, transcriber_id::integer, project_id::integer, mediaitem_id::integer, nexttranscript_id::integer from transcript'
  };
   */

  constructor() {
  }

  public static init(_dbManager: DBManager, settings: AppConfiguration, pathBuilder: PathBuilder) {
    DatabaseFunctions.dbManager = _dbManager;
    DatabaseFunctions.settings = settings;
    DatabaseFunctions.pathBuilder = pathBuilder;
  }

  public static async isValidAppToken(token: string, originHost: string): Promise<void> {
    const selectResult = await DatabaseFunctions.dbManager.query({
      text: 'select * from apptoken where key=$1::text',
      values: [token]
    });

    if (selectResult.rowCount === 1) {
      const resultRow = selectResult.rows[0] as AppTokensRow;
      // console.log(`check ${resultRow.domain} === ${originHost}`);
      if (resultRow.hasOwnProperty('domain') && resultRow.domain) {
        const domainEntry = resultRow.domain.replace(/\s+/g, '');

        if (domainEntry !== '') {
          let valid;
          if (resultRow.domain.indexOf(',') > -1) {
            // multiple domains
            const domains = domainEntry.split(',');
            valid = domains.filter(a => a !== '').findIndex(a => a === originHost) > -1;
          } else {
            // one domain
            valid = resultRow.domain.trim() === originHost;
          }

          if (valid) {
            return;
          } else {
            throw new Error(`Origin Host ${originHost} does not match the domain registered for this app key.`);
          }
        }
      }
      return;
    }

    throw new Error('Could not find app token');
  }

  public static async areRegistrationsAllowed(appToken: string): Promise<boolean> {
    const selectResult = await DatabaseFunctions.dbManager.query({
      text: 'select * from apptoken where key=$1::text',
      values: [appToken]
    });

    if (selectResult.rowCount === 1) {
      const resultRow = selectResult.rows[0] as AppTokensRow;
      return resultRow.registrations;
    }

    throw new Error('Could not check if registrations are allowed');
  }

  public static async createAppToken(data: {
    name: string,
    domain?: string,
    description?: string,
    registrations?: boolean
  }): Promise<AppTokensRow[]> {
    try {
      const token = await DatabaseFunctions.generateAppToken();

      const insertQuery: ParameterizedQuery = {
        tableName: 'apptoken',
        columns: [
          DatabaseFunctions.getColumnDefinition('name', 'text', data.name, false),
          DatabaseFunctions.getColumnDefinition('key', 'text', token, false),
          DatabaseFunctions.getColumnDefinition('domain', 'text', data.domain),
          DatabaseFunctions.getColumnDefinition('description', 'text', data.description),
          DatabaseFunctions.getColumnDefinition('registrations', 'boolean', data.registrations)
        ]
      };
      const insertionResult = await DatabaseFunctions.dbManager.insert(insertQuery, 'id');

      if (insertionResult.rowCount === 1 && insertionResult.rows[0].hasOwnProperty('id')) {
        const id = insertionResult.rows[0].id;
        const selectResult = await DatabaseFunctions.dbManager.query({
          text: 'select * from apptoken where id=$1',
          values: [id]
        });

        DatabaseFunctions.prepareRows(selectResult.rows)

        return selectResult.rows as AppTokensRow[];
      }
      throw new Error('insertionResult does not have id');
    } catch (e) {
      console.log(e);
      throw new Error('could not generate and save app token');
    }
  }

  public static async changeAppToken(data: {
    id: number,
    name: string,
    domain?: string,
    description?: string,
    registrations?: boolean
  }): Promise<AppTokensRow> {
    try {
      const updateQuery = {
        tableName: 'apptoken',
        columns: [
          DatabaseFunctions.getColumnDefinition('name', 'text', data.name, false),
          DatabaseFunctions.getColumnDefinition('domain', 'text', data.domain),
          DatabaseFunctions.getColumnDefinition('description', 'text', data.description),
          DatabaseFunctions.getColumnDefinition('registrations', 'boolean', data.registrations)
        ]
      };
      const updateResult = await DatabaseFunctions.dbManager.update(updateQuery, `id=${data.id}::integer`);

      if (updateResult.rowCount === 1) {
        const selectResult = await DatabaseFunctions.dbManager.query({
          text: 'select * from apptoken where id=$1::integer',
          values: [data.id]
        });

        DatabaseFunctions.prepareRows(selectResult.rows)

        return selectResult.rows[0] as AppTokensRow;
      } else {
        throw new Error('update app token failed');
      }
    } catch (e) {
      console.log(e);
      throw new Error('could not generate and save app token');
    }
  }


  public static async refreshAppToken(id: number): Promise<AppTokensRow> {
    try {
      const token = await this.generateAppToken();
      const updateQuery = {
        tableName: 'apptoken',
        columns: [
          DatabaseFunctions.getColumnDefinition('key', 'text', token, false)
        ]
      };
      const updateResult = await DatabaseFunctions.dbManager.update(updateQuery, `id=${id}::integer`);

      if (updateResult.rowCount === 1) {
        const selectResult = await DatabaseFunctions.dbManager.query({
          text: 'select * from apptoken where id=$1::integer',
          values: [id]
        });

        DatabaseFunctions.prepareRows(selectResult.rows)

        return selectResult.rows[0] as AppTokensRow;
      } else {
        throw new Error('refresh app token failed');
      }
    } catch (e) {
      console.log(e);
      throw new Error('could not generate and save app token');
    }
  }

  public static async createProject(data: CreateProjectRequest, currentUserID: number): Promise<PreparedProjectRow[]> {
    try {
      const startdate = DatabaseFunctions.convertJSONDateTime(data.startdate);
      const enddate = DatabaseFunctions.convertJSONDateTime(data.enddate);
      const roles = await DatabaseFunctions.getRoles();
      const insertProjectResult = await DatabaseFunctions.dbManager.insert({
        tableName: 'project',
        columns: [
          DatabaseFunctions.getColumnDefinition('name', 'text', data.name, false),
          DatabaseFunctions.getColumnDefinition('shortname', 'text', data.shortname),
          DatabaseFunctions.getColumnDefinition('description', 'text', data.description),
          DatabaseFunctions.getColumnDefinition('configuration', 'text', data.configuration),
          DatabaseFunctions.getColumnDefinition('startdate', 'timestamp', startdate),
          DatabaseFunctions.getColumnDefinition('enddate', 'timestamp', enddate)
        ]
      }, '*');

      if (insertProjectResult.rowCount === 0) {
        throw new Error('Can\'t add project.');
      } else {
        const insertProjectRole = await DatabaseFunctions.dbManager.insert({
          tableName: 'account_role_project',
          columns: [
            DatabaseFunctions.getColumnDefinition('account_id', 'integer', data.admin_id ?? currentUserID, false),
            DatabaseFunctions.getColumnDefinition('role_id', 'integer', roles.find(a => a.label === UserRole.projectAdministrator).id, false),
            DatabaseFunctions.getColumnDefinition('project_id', 'integer', insertProjectResult.rows[0].id, false)
          ]
        }, 'account_id');

        if (insertProjectRole.rowCount === 0) {
          throw new Error('Can\'t assign user role \'project_admin\'');
        }
        const userInfo = await this.getUserInfoByUserID(insertProjectRole.rows[0]['account_id']);
        insertProjectResult.rows[0]['account_roles'] = [{
          role: 'project_admin',
          account_id: userInfo.id,
          username: userInfo.username
        }];
        this.prepareRows(insertProjectResult.rows);
        return insertProjectResult.rows as PreparedProjectRow[];
      }
    } catch (e) {
      console.log(e);
      throw new Error('Could not create and save a new project.');
    }
  }

  public static async removeProject(id: number, requestBody: RemoveProjectRequest): Promise<void> {
    const sqlQueries: SQLQuery[] = [];

    if (requestBody.cutAllReferences) {
      sqlQueries.push({
        text: 'update task set project_id=null where project_id=$1::integer',
        values: [id]
      });
      sqlQueries.push({
        text: 'update file_project set project_id=null where project_id=$1::integer',
        values: [id]
      });
    } else if (requestBody.removeAllReferences) {
      sqlQueries.push({
        text: 'delete from task_input_output where task_id in (select id from task where project_id=$1::integer)',
        values: [id]
      });
      sqlQueries.push({
        text: 'delete from file_project where project_id=$1::integer',
        values: [id]
      });
      sqlQueries.push({
        text: 'delete from task where project_id=$1::integer',
        values: [id]
      });
    }

    // remove account_roles
    sqlQueries.push({
      text: 'delete from account_role_project where project_id=$1::integer',
      values: [id]
    });

    // remove project
    sqlQueries.push({
      text: 'delete from project where id=$1::numeric',
      values: [id]
    });

    await DatabaseFunctions.dbManager.transaction(sqlQueries);
    return;
  }

  public static async getProject(id: number): Promise<PreparedProjectRow> {
    try {
      const selectQuery = {
        text: OCTRASQLStatements.allProjectsWithRoles + ' where id=$1::integer',
        values: [id]
      };
      const selectResult = await DatabaseFunctions.dbManager.query(selectQuery);

      if (selectResult.rowCount === 1) {
        this.prepareRows(selectResult.rows);
        return selectResult.rows[0] as PreparedProjectRow;
      }
      throw new Error('insertionResult does not have id');
    } catch (e) {
      console.log(e);
      throw new Error('Could not create and get the project.');
    }
  }

  public static async changeProject(id: number, data: ChangeProjectRequest): Promise<ProjectRow> {
    try {
      const updateQuery = {
        tableName: 'project',
        columns: [
          DatabaseFunctions.getColumnDefinition('name', 'text', data.name),
          DatabaseFunctions.getColumnDefinition('shortname', 'text', data.shortname),
          DatabaseFunctions.getColumnDefinition('description', 'text', data.description),
          DatabaseFunctions.getColumnDefinition('configuration', 'json', data.configuration),
          DatabaseFunctions.getColumnDefinition('startdate', 'timestamp', data.startdate),
          DatabaseFunctions.getColumnDefinition('enddate', 'timestamp', data.enddate),
          DatabaseFunctions.getColumnDefinition('active', 'boolean', data.active)
        ]
      };
      const updateResult = await DatabaseFunctions.dbManager.update(updateQuery, `id=${id}::integer`);

      if (updateResult.rowCount === 1) {
        const selectResult = await DatabaseFunctions.dbManager.query({
          text: 'select * from project_all where id=$1::integer',
          values: [id]
        });

        DatabaseFunctions.prepareRows(selectResult.rows)

        return selectResult.rows[0] as ProjectRow;
      } else {
        throw new Error('Update project failed');
      }
    } catch (e) {
      console.log(e);
      throw new Error('Can\'t update project');
    }
  }

  public static async assignUserRolesProject(projectID: number, data: AssignProjectUserRolesRequestItem[]): Promise<void> {
    try {
      const ids = data.map(a => a.userID);
      const selectProjectRolesQuery = await this.dbManager.query({
        text: `select arp.*, r."label" as role
               from account_role_project as arp
                      left join "role" r on arp.role_id = r.id
               where arp.account_id = any ('{${ids.join(',')}}'::int[])
                 and arp.project_id = $1::integer
               order by arp.id desc`,
        values: [projectID]
      });

      const roles = ((await this.dbManager.query({
        text: 'select id, label from role'
      })).rows as any).map(a => ({
        id: a.id,
        role: a.label
      }));

      const dbProjectRoles = (selectProjectRolesQuery.rows as any).map(a => ({
        userID: a.account_id,
        role: a.role,
        valid_startdate: a.valid_startdate,
        valid_enddate: a.valid_enddate
      })) as AssignProjectUserRolesRequestItem[];

      const sqlQueries: SQLQuery[] = [];

      for (const entry of data) {
        const role = roles.find(a => a.role === entry.role);

        if (!role) {
          throw new Error(`Can't find role id of role "${entry.role}"`);
        }

        if (dbProjectRoles.find(a => a.userID === entry.userID)) {
          // change role
          sqlQueries.push({
            text: `update account_role_project
                   set role_id=$1::int
                   where project_id = $2::int
                     and account_id = $3::int
                   returning *`,
            values: [role.id, projectID, entry.userID]
          });
        } else {
          // add role
          sqlQueries.push(this.dbManager.createSQLQueryForInsert({
            tableName: 'account_role_project',
            columns: [
              this.getColumnDefinition('account_id', 'integer', entry.userID, false),
              this.getColumnDefinition('role_id', 'integer', role.id, false),
              this.getColumnDefinition('project_id', 'integer', projectID, false),
              this.getColumnDefinition('valid_startdate', 'string', entry.valid_startdate),
              this.getColumnDefinition('valid_enddate', 'string', entry.valid_enddate)
            ]
          }, '*'));
        }
      }

      await this.dbManager.transaction(sqlQueries);
      return;
    } catch (e) {
      console.log(e);
      throw new Error('Can\'t update project');
    }
  }

  public static async listProjects(): Promise<ProjectResponseDataItem[]> {
    try {
      const selectQuery = {
        text: OCTRASQLStatements.allProjectsWithRoles
      };
      const selectResult = await DatabaseFunctions.dbManager.query(selectQuery);

      if (selectResult.rowCount > 0) {
        selectResult.rows = selectResult.rows.filter(a => (a.id !== null && a.id !== undefined));
        this.prepareRows(selectResult.rows);
        return selectResult.rows as ProjectResponseDataItem[];
      }
      throw new Error('insertionResult does not have id');
    } catch (e) {
      console.log(e);
      throw new Error('Could not create and save a new project.');
    }
  }

  public static async getFileItemByHash(hash: string): Promise<FileRow | undefined> {
    try {
      const selectResult = await this.dbManager.query({
        text: 'select * from file where hash=$1::text',
        values: [hash]
      });
      if (selectResult.rows.length === 1) {
        this.prepareRows(selectResult.rows);
        return selectResult.rows[0] as FileRow;
      }
      return undefined;
    } catch (e) {
      return undefined;
    }
  }

  public static async getFileItemByURL(url: string): Promise<FileRow | undefined> {
    try {
      const selectResult = await this.dbManager.query({
        text: 'select * from file where url=$1::text',
        values: [url]
      });
      if (selectResult.rows.length === 1) {
        this.prepareRows(selectResult.rows);
        return selectResult.rows[0] as FileRow;
      }
      return undefined;
    } catch (e) {
      return undefined;
    }
  }

  public static async addFileItem(data: AddFileRequest): Promise<FileRow> {
    try {
      const insertResult = await this.dbManager.insert({
        tableName: 'file',
        columns: [
          this.getColumnDefinition('url', 'text', data.url, false),
          this.getColumnDefinition('type', 'text', data.type),
          this.getColumnDefinition('size', 'integer', data.size),
          this.getColumnDefinition('uploader_id', 'integer', data.uploader_id),
          this.getColumnDefinition('original_name', 'text', data.original_name),
          this.getColumnDefinition('hash', 'text', data.hash),
          this.getColumnDefinition('metadata', 'json', data.metadata)
        ]
      }, '*');

      if (insertResult.rows.length === 1) {
        this.prepareRows(insertResult.rows);
        return insertResult.rows[0] as FileRow;
      }
      throw new Error('Couldn\'t add file item.');
    } catch (e) {
      console.log(e);
      throw new Error('Couldn\'t add file item.');
    }
  }

  // TODO remove this function?
  public static async addFileProjectItem(data: AddFileProjectRequest): Promise<PreparedFileProjectRow[]> {
    try {
      let file_project_row;

      // const check if file_project_item already exists
      let selectQuery = await this.dbManager.query({
        text: 'select * from project_file_all where file_id=$1::integer and project_id=$2::integer',
        values: [data.file_id, data.project_id]
      });

      if (selectQuery.rowCount > 0) {
        file_project_row = selectQuery.rows[0] as PreparedFileProjectRow;
      } else {
        const insertQuery = {
          tableName: 'file_project',
          columns: [
            DatabaseFunctions.getColumnDefinition('file_id', 'integer', data.file_id, false),
            DatabaseFunctions.getColumnDefinition('project_id', 'integer', data.project_id),
            DatabaseFunctions.getColumnDefinition('virtual_folder_path', 'text', data.virtual_folder_path),
            DatabaseFunctions.getColumnDefinition('virtual_filename', 'text', data.virtual_filename)
          ]
        };

        const insertionResult = await DatabaseFunctions.dbManager.insert(insertQuery, '*');
        if (insertionResult.rowCount === 1 && insertionResult.rows[0].hasOwnProperty('id')) {
          const selectQuery = await this.dbManager.query({
            text: 'select * from file_project where id=$1::integer',
            values: [insertionResult.rows[0].id]
          });

          if (selectQuery.rowCount > 0) {
            file_project_row = selectQuery.rows[0] as PreparedFileProjectRow;
          }
        } else {
          throw new Error('insertionResult does not have id');
        }
      }
      this.prepareRows([file_project_row]);
      if (file_project_row.url && !(/https?:\/\//g.exec(file_project_row.url))) {
        file_project_row.url = this.pathBuilder.getEncryptedProjectFileURL(data.project_id, data.virtual_filename);
      }

      return [file_project_row];
    } catch (e) {
      console.log(e);
      throw new Error('Could not save a new media item.');
    }
    throw new Error('Could not save a new media item.');
  }

  public static async addTool(data: AddToolRequest): Promise<ToolRow[]> {
    try {
      const insertQuery = {
        tableName: 'tool',
        columns: [
          DatabaseFunctions.getColumnDefinition('name', 'text', data.name, false),
          DatabaseFunctions.getColumnDefinition('version', 'text', data.version),
          DatabaseFunctions.getColumnDefinition('description', 'text', data.description),
          DatabaseFunctions.getColumnDefinition('pid', 'text', data.pid)
        ]
      };
      const insertionResult = await DatabaseFunctions.dbManager.insert(insertQuery, 'id');

      if (insertionResult.rowCount === 1 && insertionResult.rows[0].hasOwnProperty('id')) {
        const id = insertionResult.rows[0].id;
        const selectResult = await DatabaseFunctions.dbManager.query({
          text: 'select * from tool where id=$1',
          values: [id]
        });
        this.prepareRows(selectResult.rows);
        return selectResult.rows as ToolRow[];
      }
      throw new Error('insertionResult does not have id');
    } catch (e) {
      console.log(e);
      throw new Error('Could not save a new tool.');
    }
  }

  public static async addTask(properties: TaskProperties, inputs: TaskInputOutputRow[], log: any): Promise<PreparedTaskRow[]> {
    const startdate = DatabaseFunctions.convertJSONDateTime(properties.startdate);
    const enddate = DatabaseFunctions.convertJSONDateTime(properties.enddate);
    try {
      const transactionQueries = [
        this.dbManager.createSQLQueryForInsert({
          tableName: 'task',
          columns: [
            DatabaseFunctions.getColumnDefinition('pid', 'text', properties.pid),
            DatabaseFunctions.getColumnDefinition('orgtext', 'text', properties.orgtext),
            DatabaseFunctions.getColumnDefinition('assessment', 'text', properties.assessment),
            DatabaseFunctions.getColumnDefinition('priority', 'integer', properties.priority),
            DatabaseFunctions.getColumnDefinition('status', 'text', properties.status),
            DatabaseFunctions.getColumnDefinition('code', 'text', properties.code),
            DatabaseFunctions.getColumnDefinition('startdate', 'timestamp', startdate),
            DatabaseFunctions.getColumnDefinition('enddate', 'timestamp', enddate),
            DatabaseFunctions.getColumnDefinition('log', 'json', log),
            DatabaseFunctions.getColumnDefinition('comment', 'text', properties.comment),
            DatabaseFunctions.getColumnDefinition('tool_id', 'integer', properties.tool_id),
            DatabaseFunctions.getColumnDefinition('worker_id', 'integer', properties.worker_id),
            DatabaseFunctions.getColumnDefinition('project_id', 'integer', properties.project_id),
            DatabaseFunctions.getColumnDefinition('nexttask_id', 'integer', properties.nexttask_id),
            DatabaseFunctions.getColumnDefinition('type', 'text', properties.type)
          ]
        }, 'id')
      ];

      for (const input of inputs) {
        transactionQueries.push(this.dbManager.createSQLQueryForInsert({
          tableName: 'task_input_output',
          columns: [
            DatabaseFunctions.getColumnDefinition('task_id', undefined, 'currval(\'transcription_id_seq\')'),
            DatabaseFunctions.getColumnDefinition('file_project_id', 'integer', input.file_project_id),
            DatabaseFunctions.getColumnDefinition('type', 'text', 'input', false),
            DatabaseFunctions.getColumnDefinition('creator_type', 'text', input.creator_type, false),
            DatabaseFunctions.getColumnDefinition('label', 'text', input.label, false),
            DatabaseFunctions.getColumnDefinition('description', 'text', input.description),
            DatabaseFunctions.getColumnDefinition('filename', 'timestamp', input.filename),
            DatabaseFunctions.getColumnDefinition('url', 'timestamp', input.url),
            DatabaseFunctions.getColumnDefinition('content', 'json', input.content)
          ]
        }, '*'));
      }

      const insertionResults = await DatabaseFunctions.dbManager.transaction(transactionQueries);

      if (insertionResults.length > 0) {
        const selectResult = await this.dbManager.query({
          text: `select *
                 from task_all
                 where id = $1::integer`,
          values: [insertionResults[0][0].id]
        });

        if (selectResult.rows.length > 0) {
          selectResult.rows = this.prepareTaskRows(selectResult.rows as PreparedTaskRow[]);
          return selectResult.rows as PreparedTaskRow[];
        }
        throw new Error(`Can't find created task.`);
      }
      throw new Error('insertionResult does not have id');
    } catch (e) {
      throw e;
    }
  }


  public static async freeAnnotation(projectID: number, taskID: number, tokenData: TokenData): Promise<PreparedTaskRow> {
    try {
      const selectQuery: SQLQuery = {
        'text': `select *
                 from task
                 where project_id = $1::integer
                   and id = $2::integer
                   and status = 'BUSY'
                   and worker_id = $3::integer`,
        values: [projectID, taskID, tokenData.id]
      };

      let selectResult = await DatabaseFunctions.dbManager.query(selectQuery);

      if (selectResult.rowCount < 1) {
        throw new Error(`Can not free annotation ${taskID} because it either not busy, not found or you don't have the access rights to reset its status.`);
      }

      let taskRow = selectResult.rows[0] as PreparedTaskRow;

      // Set transcript status to BUSY and set transcriber_id, set start date, tool_id
      const updateResult = await DatabaseFunctions.dbManager.query({
        text: `update task
               set status='FREE',
                   worker_id=null
               where id = ${taskRow.id}:: integer`
      });

      if (updateResult.rowCount !== 1) {
        throw new Error(`Can not free annotation ${taskID}: update failed.`);
      }
      // status set to BUSY

      taskRow = (await this.dbManager.query({
        text: `select *
               from task_all
               where id = $1::integer`,
        values: [taskID]
      })).rows[0] as PreparedTaskRow;

      const freeRows = await this.dbManager.query({
        text: `select id
               from task
               where status = 'FREE'
                 and project_id = $1::integer`,
        values: [projectID]
      });

      taskRow.tasks_count_free = freeRows.rowCount;
      taskRow = this.prepareTaskRows([taskRow])[0];
      this.prepareRows([taskRow]);
      return taskRow;
    } catch (e) {
      throw e;
    }

    return undefined;
  }

  public static async startAnnotation(data: StartAnnotationRequest, projectID: number, tokenData: TokenData): Promise<PreparedTaskRow> {
    try {
      // TODO check next transcript!
      const insertQuery: SQLQuery = {
        'text': `select *
                 from task_all
                 where project_id = $1::integer
                   and status = 'FREE'
                 order by priority desc`,
        values: [projectID]
      };

      let selectResult = await DatabaseFunctions.dbManager.query(insertQuery);

      if (selectResult.rowCount < 1) {
        return null;
      }

      let taskRow = selectResult.rows[0] as PreparedTaskRow;

      // Set transcript status to BUSY and set transcriber_id, set start date, tool_id
      const updateResult = await DatabaseFunctions.dbManager.query({
        text: `update task
               set status='BUSY',
                   worker_id=${tokenData.id}::integer,
                   startdate=(to_timestamp(${Date.now()} / 1000.0))
               where id = ${taskRow.id}:: integer`
      });

      if (updateResult.rowCount !== 1) {
        throw new Error(`Can not set status to BUSY of transcript with id ${taskRow.id}.`);
      }
      // status set to BUSY

      taskRow.tasks_count_free = selectResult.rows.length - 1;
      taskRow = this.prepareTaskRows([taskRow])[0];
      return taskRow;
    } catch (e) {
      throw e;
    }

    return undefined;
  }


  public static async saveAnnotation(data: SaveAnnotationRequest, projectID: number, taskID, tokenData: TokenData): Promise<PreparedTaskRow> {
    try {
      const selectQuery: SQLQuery = {
        'text': `select *
                 from task_all
                 where project_id = $1::integer
                   and id = $2::integer
                   and status = 'BUSY'`,
        values: [projectID, taskID]
      };

      let selectResult = await DatabaseFunctions.dbManager.query(selectQuery);

      if (selectResult.rowCount < 1) {
        throw new Error(`Can not find proper annotation to overwrite.`);
      }

      let taskRow = selectResult.rows[0] as PreparedTaskRow;

      const transactions = [
        this.dbManager.createSQLQueryForUpdate({
          tableName: 'task',
          columns: [
            DatabaseFunctions.getColumnDefinition('worker_id', 'integer', tokenData.id, false),
            DatabaseFunctions.getColumnDefinition('enddate', '', `(to_timestamp(${Date.now()} / 1000.0))`, false),
            DatabaseFunctions.getColumnDefinition('tool_id', 'integer', data.tool_id, false),
            DatabaseFunctions.getColumnDefinition('status', 'text', TaskStatus.annotated),
            DatabaseFunctions.getColumnDefinition('comment', 'text', data.comment),
            DatabaseFunctions.getColumnDefinition('assessment', 'text', data.assessment),
            DatabaseFunctions.getColumnDefinition('log', 'json', JSON.stringify(data.log))
          ]
        }, `id=${taskRow.id}:: integer`),
        this.dbManager.createSQLQueryForInsert({
          tableName: 'task_input_output',
          columns: [
            DatabaseFunctions.getColumnDefinition('task_id', 'integer', taskID, false),
            DatabaseFunctions.getColumnDefinition('type', 'text', 'output', false),
            DatabaseFunctions.getColumnDefinition('creator_type', 'text', 'annotator', false),
            DatabaseFunctions.getColumnDefinition('label', 'text', 'transcript', false),
            DatabaseFunctions.getColumnDefinition('content', 'json', JSON.stringify(data.transcript), false)
          ]
        }, '*')
      ]
      const updateResult = await this.dbManager.transaction(transactions);
      if (updateResult.length < 1) {
        throw new Error(`Can not save annotation with id ${taskRow.id}.`);
      }

      selectResult = await this.dbManager.query({
        'text': `select *
                 from task_all
                 where project_id = $1::integer
                   and id = $2::integer`,
        values: [projectID, taskID]
      });
      if (selectResult.rowCount > 0) {
        taskRow = selectResult.rows[0] as PreparedTaskRow;
        selectResult = await this.dbManager.query({
          'text': `select *
                   from task_all
                   where project_id = $1::integer
                     and status = 'FREE'`,
          values: [projectID]
        });
        taskRow.tasks_count_free = selectResult.rowCount;
        // saved
      } else {
        throw new Error(`Can not find proper annotation to overwrite.`);
      }

      taskRow = this.prepareTaskRows([taskRow])[0];
      return taskRow;
    } catch (e) {
      throw e;
    }
    return undefined;
  }

  public static async continueAnnotation(projectID: number, transcriptID: number, tokenData: TokenData): Promise<PreparedTaskRow> {
    try {
      const selectQuery: SQLQuery = {
        'text': `select *
                 from task_all
                 where project_id = $1::integer
                   and id = $2::integer`,
        values: [projectID, transcriptID]
      };

      let selectResult = await DatabaseFunctions.dbManager.query(selectQuery);

      if (selectResult.rowCount < 1) {
        return null;
      }

      let taskRow = selectResult.rows[0] as PreparedTaskRow;

      if (taskRow.worker_id !== tokenData.id) {
        throw new Error(`Can not continue transcript with id ${taskRow.id} because the transcriber IDs are not equal.`);
      }

      if (taskRow.status !== 'BUSY') {
        throw new Error(`Can not continue transcript with id ${taskRow.id} because its status is not equal 'BUSY'`);
      }

      taskRow = this.prepareTaskRows([taskRow])[0];
      return taskRow;
    } catch (e) {
      throw e;
    }

    return undefined;
  }

  public static async getTaskByID(id: number): Promise<PreparedTaskRow> {
    const selectResult = await DatabaseFunctions.dbManager.query({
      text: 'select * from task_all where id=$1::integer',
      values: [id]
    });

    if (selectResult.rowCount === 1) {
      let result: PreparedTaskRow = selectResult.rows[0] as PreparedTaskRow;
      result = this.prepareTaskRows([result])[0];
      return result;
    }
    throw new Error('Could not find a transcript with this ID.')
  }

  public static async changeTranscriptsStatus(data: ProjectTranscriptsChangeStatusRequestItem[]): Promise<void> {
    const sqlStatements: SQLQuery[] = [];

    for (const operation of data) {
      if (operation.listOfIds.length === 0) {
        throw new Error('Length of listOfIds is 0.')
      }
      const ids = operation.listOfIds.join(',');
      sqlStatements.push({
        text: `update task
               set status=$1::text
               where id = any ('{${ids}}'::int[])`,
        values: [operation.status]
      });
    }

    const transaction = await this.dbManager.transaction(sqlStatements);

    if (transaction.length > 0) {
      return;
    }

    throw new Error('Can\'t update status of given ids.')
  }

  public static async getTasksByProjectID(projectID: number): Promise<PreparedTaskRow[]> {
    const projectSelectResult = await DatabaseFunctions.dbManager.query({
      text: 'select * from task_all where project_id=$1::integer',
      values: [projectID]
    });

    let results = projectSelectResult.rows as PreparedTaskRow[];
    if (results.length > 0) {
      results = this.prepareTaskRows(results);
      return results;
    }
    return [];
  }

  public static async removeAppToken(id: number): Promise<void> {
    const removeResult = await DatabaseFunctions.dbManager.query({
      text: 'delete from apptoken where id=$1::numeric',
      values: [id]
    });
    if (removeResult.rowCount < 1) {
      throw new Error('could not remove app token');
    }
    return;
  }

  public static async listAppTokens(): Promise<AppTokensRow[]> {
    const selectResult = await DatabaseFunctions.dbManager.query({
      text: 'select * from apptoken order by id'
    });
    DatabaseFunctions.prepareRows(selectResult.rows);
    return selectResult.rows as AppTokensRow[];
  }

  static async createUser(userData: {
    name?: string,
    email?: string,
    password: string,
    loginmethod: string
  }): Promise<PreparedAccountRow> {
    const roles = await this.getRoles();
    const userRole = roles.find(a => a.label === UserRole.user);

    if (!userRole) {
      throw new Error('Couldn\'t find user role in role table.');
    }

    const insertAccountPersonQuery = {
      tableName: 'account_person',
      columns: [
        DatabaseFunctions.getColumnDefinition('username', 'text', userData.name),
        DatabaseFunctions.getColumnDefinition('email', 'text', userData.email),
        DatabaseFunctions.getColumnDefinition('hash', 'text', userData.password),
        DatabaseFunctions.getColumnDefinition('loginmethod', 'text', userData.loginmethod)
      ]
    };
    const insertAccountQuery = {
      tableName: 'account',
      columns: [
        DatabaseFunctions.getColumnDefinition('account_person_id', undefined, 'currval(\'account_person_id_seq\')'),
        DatabaseFunctions.getColumnDefinition('role_id', 'integer', userRole.id)
      ]
    };
    //const insertionAccountPersonResult = await DatabaseFunctions.dbManager.insert(insertAccountQuery, 'id');

    const transaction = await DatabaseFunctions.dbManager.transaction([
      DatabaseFunctions.dbManager.createSQLQueryForInsert(insertAccountPersonQuery, 'id'),
      DatabaseFunctions.dbManager.createSQLQueryForInsert(insertAccountQuery, '*'),
      {
        text: 'select id from account_all where id=currval(\'account_id_seq\')'
      }
    ]);


    if (transaction.length === 3 && transaction[2][0].hasOwnProperty('id')) {
      const accountRow = transaction[2][0] as PreparedAccountRow;
      return {
        ...accountRow,
        accessRights: [
          {
            scope: UserRoleScope.general,
            role: UserRole.user
          }]
      }
    }
    throw new Error('Could not create user.');
  }

  // TODO remove/replace?
  static async assignUserRolesToUser(data: AssignUserRoleRequest) {
    const rolesTable = await this.getRoles();

    const queries: SQLQuery[] = [];

    // remove all roles from this account at first
    queries.push({
      text: 'delete from account_role_project where account_id=$1::integer',
      values: [data.accountID]
    });

    const roleEntry = rolesTable.find(a => a.label === data.role.toString());

    if (roleEntry) {
      const roleID = roleEntry.id;
      if (roleEntry.scope === 'general') {
        queries.push({
          text: 'update account set role_id=$1::integer where id=$2::integer',
          values: [roleID, data.accountID]
        });
      }
    } else {
      throw new Error(`Could not find role '${data.role}'`);
    }

    try {
      await DatabaseFunctions.dbManager.transaction(queries);
    } catch (e) {
      throw new Error('Could not assign role');
    }
    return;
  }

  static async getRoles() {
    const result = await DatabaseFunctions.dbManager.query({
      text: 'select * FROM role'
    });
    return result.rows as RolesRow[];
  }

  static async getRolesByUserID(id: number): Promise<string[]> {
    const rolesTable = await DatabaseFunctions.getRoles();
    const accountRolesTable = await DatabaseFunctions.dbManager.query({
      text: 'select * from account_role_project where account_id=$1::integer',
      values: [id]
    });
    return (accountRolesTable.rows as any).map(a => a.role_id)
      .map(a => {
        const role = rolesTable.find(b => b.id === a);
        if (role) {
          return role.label;
        }
        return null;
      })
      .filter(a => a !== null);
  }

  static async listUsers(): Promise<UserInfoResponseDataItem[]> {
    const selectResult = await DatabaseFunctions.dbManager.query({
      text: OCTRASQLStatements.allUsersWithRoles
    });


    // set username of deleted users
    selectResult.rows = (selectResult.rows as PreparedAccountRow[]).map(a => {
      const result = {
        ...a,
        username: a.username ?? `DeletedUser_${a.id}`,
        accessRights: a['access_rights']
      };
      delete result['access_rights'];
      return result;
    });
    DatabaseFunctions.prepareRows(selectResult.rows);

    return selectResult.rows as UserInfoResponseDataItem[];
  }

  static async removeUserByID(id: number): Promise<void> {
    try {
      await DatabaseFunctions.dbManager.transaction([
        {
          text: 'update task set worker_id=null where worker_id=$1::integer',
          values: [id]
        },
        {
          text: 'delete from account_role_project where account_id=$1::integer',
          values: [id]
        },
        {
          text: 'delete from account where id=$1::integer',
          values: [id]
        }
      ]);
    } catch (e) {
      throw new Error(`Could not remove user account.}.`);
    }
    return;
  }

  static async checkUserExistsByHash(loginmethod: 'shibboleth' | 'local', hash: string): Promise<boolean> {
    const selectResult = await DatabaseFunctions.getUserInfo({hash});

    if (selectResult) {
      DatabaseFunctions.prepareRows([selectResult]);
      return true;
    }

    return false;
  }

  static async getUserInfo(data: {
    name?: string;
    email?: string;
    hash?: string;
    id?: number;
  }): Promise<UserInfoResponseDataItem> {
    let selectResult = null;
    const sqlStatement = OCTRASQLStatements.allUsersWithRoles;

    if (data.id && isNumber(data.id)) {
      selectResult = await DatabaseFunctions.dbManager.query({
        text: `${sqlStatement} where ac.id=$1::integer;`,
        values: [data.id]
      });
    } else if (data.name && data.name.trim() !== '') {
      selectResult = await DatabaseFunctions.dbManager.query({
        text: `${sqlStatement} where ac.username=$1::text;`,
        values: [data.name]
      });
    } else if (data.hash && data.hash.trim() !== '') {
      console.log(`get by hash ${data.hash}`);
      selectResult = await DatabaseFunctions.dbManager.query({
        text: `${sqlStatement} where ac.hash=$1::text;`,
        values: [data.hash]
      });
    } else if (data.email && data.email.trim() !== '') {
      selectResult = await DatabaseFunctions.dbManager.query({
        text: `${sqlStatement} where ac.email=$1::text;`,
        values: [data.email]
      });
    }

    if (selectResult) {
      DatabaseFunctions.prepareRows(selectResult.rows);
      const row = selectResult.rows[0] as UserInfoResponseDataItem;
      row.username = row.username ?? `DeletedUser_${row.id}`;
      row.accessRights = row['access_rights'];
      delete row['access_rights'];
      if (selectResult.rowCount > 0) {
        return row;
      }
    }

    return null;
  }


  static async changeUserPassword(id: number, hash: string): Promise<void> {
    const updateResult = await DatabaseFunctions.dbManager.query({
      text: 'update account_person as ap set hash=$1::text from account_all as a_all where a_all.id=$2::integer and ap.id=a_all.person_id returning a_all.id',
      values: [hash, id]
    });

    if (updateResult.rowCount === 1) {
      return;
    }

    throw new Error('Can not change password.');
  }


  static async getUserInfoByUserID(id: number): Promise<UserInfoResponseDataItem> {
    const result = await DatabaseFunctions.getUserInfo({id});

    if (result) {
      return result;
    }
    throw new Error('could not find user');
  }

  static async createTask(dataDeliveryRequest: DeliverNewMediaRequest): Promise<PreparedTaskRow> {
    const mediaInsertResult = await DatabaseFunctions.addFileProjectItem({
      virtual_filename: dataDeliveryRequest.file.virtual_filename,
      virtual_folder_path: '',
      file_id: dataDeliveryRequest.file.file_id,
      project_id: dataDeliveryRequest.project_id
    });

    if (mediaInsertResult.length > 0) {
      const mediaID = mediaInsertResult[0].id;
      // TODO add task
      const transcriptResult = await DatabaseFunctions.addTask({
        orgtext: dataDeliveryRequest.orgtext,
        project_id: dataDeliveryRequest.project_id,
        type: 'annotation',
        status: 'DRAFT'
      }, [
        {
          type: 'input',
          creator_type: 'uploader',
          label: 'audio',
          file_project_id: mediaID
        },
        {
          type: 'input',
          creator_type: 'uploader',
          label: 'transcript',
          content: dataDeliveryRequest.transcript
        }
      ], dataDeliveryRequest.log);

      if (transcriptResult.length > 0) {
        return transcriptResult[0] as PreparedTaskRow;
      }

      throw new Error('Could not save transcript entry.')
    }
    throw new Error('Could not save media entry.')
  }

  static async generateAppToken(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      randomBytes(20, function (err, buffer) {
        if (err) {
          reject(err);
        } else {
          resolve(buffer.toString('hex'));
        }
      });
    });
  }

  static prepareRows(rows: any[]) {
    for (const row of rows) {
      for (const col in row) {
        if (row.hasOwnProperty(col)) {
          if (row[col] === null || row[col] === undefined) {
            delete row[col];
          } else if (row.hasOwnProperty(col) && col.indexOf('date') > -1
            && !(row[col] === undefined || row[col] === null)) {
            if (row[col] !== '' && DateTime.fromSQL(row[col]).toJSON()) {
              row[col] = DateTime.fromSQL(row[col]).toJSON();
            } else {
              row[col] = DateTime.fromISO(row[col]).toJSON();
            }
          } else if (row.hasOwnProperty(col) && col.indexOf('id') > -1
            && !(row[col] === undefined || row[col] === null)) {
            row[col] = Number(row[col]);
          } else if (typeof row[col] === 'object') {
            row[col] = this.prepareRows([row[col]])[0];
          }
        }
      }
    }
    return rows;
  }

  static getColumnDefinition(key: string, type: string, value: any, maybeNull = true) {
    return {
      key, type, value, maybeNull
    };
  }

  public static getPasswordHash(password: string): string {
    const salt = SHA256(DatabaseFunctions.settings.api.passwordSalt).toString();

    return SHA256(password + salt).toString();
  }

  static convertJSONDateTime(datetime: string) {
    return (datetime) ? DateTime.fromISO(datetime).toSQL({
      includeOffset: true
    }) : undefined;
  }

  static getPublicFileURL(projectID: number, path: string) {
    if (path) {
      const regex = /^https?:\/\//g;
      const matches = regex.exec(path);

      if (matches !== null) {
        return path;
      } else {
        if (projectID) {
          return this.pathBuilder.getEncryptedProjectFileURL(projectID, path);
        } else {
          return this.pathBuilder.getEncryptedUploadURL(path);
        }
      }
    }
    return undefined;
  }

  static prepareTaskRows(rows: PreparedTaskRow[]): PreparedTaskRow[] {
    rows = DatabaseFunctions.prepareRows(rows);
    const prepareInputOutputArray = (array: any[]) => {
      if (!array || array.length < 1 || array === [{}]) {
        return [];
      }

      return this.prepareRows(array.map(b => {
        if (b && Object.keys(b).length > 0) {
          const result = {
            ...b,
            url: this.getPublicFileURL(undefined, b.url)
          };

          if (b.file) {
            b.file = {
              ...b.file,
              url: this.getPublicFileURL(undefined, b.file?.url)
            };
          }
          return result;
        }
        return undefined;
      })).filter(a => a !== undefined);
    }
    rows = rows.map(a => ({
      ...a,
      inputs: prepareInputOutputArray(a.inputs),
      outputs: prepareInputOutputArray(a.outputs),
    }))
    return rows;
  }

}
