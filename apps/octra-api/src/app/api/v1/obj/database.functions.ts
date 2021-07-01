import {AppConfiguration} from '../../../obj/app-config/app-config';
import {randomBytes} from 'crypto';
import {
  AccountRow,
  AddMediaItemRequest,
  AddToolRequest,
  AddTranscriptRequest,
  AppTokensRow,
  AssignUserRoleRequest,
  CreateProjectRequest,
  DeliverNewMediaRequest,
  MediaItemRow,
  ProjectResponseDataItem,
  ProjectRow,
  ProjectTranscriptsGetResult,
  RemoveProjectRequest,
  RolesRow,
  SaveAnnotationRequest,
  StartAnnotationRequest,
  ToolRow,
  TranscriptRow,
  UserRole
} from '@octra/db';
import {SHA256} from 'crypto-js';
import {DBManager, SQLQuery} from '../../../db/db.manager';
import {TokenData} from './types';
import {DateTime} from 'luxon';

export class DatabaseFunctions {
  private static dbManager: DBManager;
  private static settings: AppConfiguration;

  private static selectAllStatements = {
    appToken: 'select id::integer, name::text, key::text, domain::text, description::text, registrations::boolean from apptoken',
    account: 'select ac.id::integer, ac.username::text, ac.email::text, ac.loginmethod::text, ac.active::boolean, ac.hash::text, ac.training::text, ac.comment::text, ac.createdate::timestamp from account ac',
    project: 'select id::integer, name::text, shortname::text, description::text, configuration::text, startdate::timestamp, enddate::timestamp, active::boolean, admin_id::integer from project',
    mediaitem: 'select id::integer, url::text, type::text, size::integer, metadata::text from mediaitem',
    tool: 'select id::integer, name::text, version::text, description::text, pid::text from tool',
    transcript: 'select id::integer, pid::text, orgtext::text, transcript::text, assessment::text, priority::integer, status::text, code::text, creationdate::timestamp, startdate::timestamp, enddate::timestamp, log::text, comment::text, tool_id::integer, transcriber_id::integer, project_id::integer, mediaitem_id::integer, nexttranscript_id::integer from transcript'
  };

  constructor() {
  }

  public static init(_dbManager: DBManager, settings: AppConfiguration) {
    DatabaseFunctions.dbManager = _dbManager;
    DatabaseFunctions.settings = settings;
  }

  public static async isValidAppToken(token: string, originHost: string): Promise<void> {
    const selectResult = await DatabaseFunctions.dbManager.query({
      text: DatabaseFunctions.selectAllStatements.appToken + ' where key=$1::text',
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
      text: DatabaseFunctions.selectAllStatements.appToken + ' where key=$1::text',
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

      const insertQuery = {
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
          text: DatabaseFunctions.selectAllStatements.appToken + ' where id=$1',
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
          text: DatabaseFunctions.selectAllStatements.appToken + ' where id=$1::integer',
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
          text: DatabaseFunctions.selectAllStatements.appToken + ' where id=$1::integer',
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

  public static async createProject(data: CreateProjectRequest): Promise<ProjectRow[]> {
    try {
      const startdate = DatabaseFunctions.convertJSONDateTime(data.startdate);
      const enddate = DatabaseFunctions.convertJSONDateTime(data.enddate);

      const insertQuery = {
        tableName: 'project',
        columns: [
          DatabaseFunctions.getColumnDefinition('name', 'text', data.name, false),
          DatabaseFunctions.getColumnDefinition('shortname', 'text', data.shortname),
          DatabaseFunctions.getColumnDefinition('description', 'text', data.description),
          DatabaseFunctions.getColumnDefinition('configuration', 'text', data.configuration),
          DatabaseFunctions.getColumnDefinition('startdate', 'timestamp', startdate),
          DatabaseFunctions.getColumnDefinition('enddate', 'timestamp', enddate),
          DatabaseFunctions.getColumnDefinition('active', 'boolean', data.active),
          DatabaseFunctions.getColumnDefinition('admin_id', 'integer', data.admin_id)
        ]
      };
      const insertionResult = await DatabaseFunctions.dbManager.insert(insertQuery, 'id');

      if (insertionResult.rowCount === 1 && insertionResult.rows[0].hasOwnProperty('id')) {
        const id = insertionResult.rows[0].id;
        const selectResult = await DatabaseFunctions.dbManager.query({
          text: DatabaseFunctions.selectAllStatements.project + ' where id=$1',
          values: [id]
        });
        this.prepareRows(selectResult.rows);
        return selectResult.rows as ProjectRow[];
      }
      throw new Error('insertionResult does not have id');
    } catch (e) {
      console.log(e);
      throw new Error('Could not create and save a new project.');
    }
  }

  public static async removeProject(id: number, requestBody: RemoveProjectRequest): Promise<void> {
    const sqlQueries: SQLQuery[] = [];

    if (requestBody.cutAllReferences) {
      sqlQueries.push({
        text: 'update transcript set project_id=null where project_id=$1::integer',
        values: [id]
      });
    } else if (requestBody.removeAllReferences) {
      sqlQueries.push({
        text: 'delete from transcript where project_id=$1::integer',
        values: [id]
      });
    }

    // remove project
    sqlQueries.push({
      text: 'delete from project where id=$1::numeric',
      values: [id]
    });

    const removeResult = await DatabaseFunctions.dbManager.transaction(sqlQueries);
    if (removeResult.command === 'COMMIT') {
      return;
    }
    return;
  }

  public static async getProject(id: number): Promise<ProjectRow> {
    try {
      const selectQuery = {
        text: DatabaseFunctions.selectAllStatements.project + ' where id=$1::integer order by id asc',
        values: [id]
      };
      const selectResult = await DatabaseFunctions.dbManager.query(selectQuery);

      if (selectResult.rowCount === 1) {
        this.prepareRows(selectResult.rows);
        return selectResult.rows[0] as ProjectRow;
      }
      throw new Error('insertionResult does not have id');
    } catch (e) {
      console.log(e);
      throw new Error('Could not create and save a new project.');
    }
  }

  public static async changeProject(id: number, data: CreateProjectRequest): Promise<ProjectRow> {
    try {
      const updateQuery = {
        tableName: 'project',
        columns: [
          DatabaseFunctions.getColumnDefinition('name', 'text', data.name),
          DatabaseFunctions.getColumnDefinition('shortname', 'text', data.shortname),
          DatabaseFunctions.getColumnDefinition('description', 'text', data.description),
          DatabaseFunctions.getColumnDefinition('configuration', 'text', data.configuration),
          DatabaseFunctions.getColumnDefinition('startdate', 'timestamp', data.startdate),
          DatabaseFunctions.getColumnDefinition('enddate', 'timestamp', data.enddate),
          DatabaseFunctions.getColumnDefinition('active', 'boolean', data.active),
          DatabaseFunctions.getColumnDefinition('admin_id', 'integer', data.admin_id)
        ]
      };
      const updateResult = await DatabaseFunctions.dbManager.update(updateQuery, `id=${id}::integer`);

      if (updateResult.rowCount === 1) {
        const selectResult = await DatabaseFunctions.dbManager.query({
          text: DatabaseFunctions.selectAllStatements.project + ' where id=$1::integer',
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

  public static async listProjects(): Promise<ProjectResponseDataItem[]> {
    try {
      const selectQuery = {
        text: 'select pr.id::integer, pr.name::text, pr.shortname::text, pr.description::text, pr.configuration::text, pr.startdate::timestamp, pr.enddate::timestamp, pr.active::boolean, pr.admin_id::integer, count(transcript.id)::integer as transcripts_count, count(case when transcript.status=\'FREE\' then transcript.id end)::integer as transcripts_count_free from transcript full outer join project pr on transcript.project_id=pr.id group by pr.id order by pr.id;'
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

  public static async addMediaItem(data: AddMediaItemRequest): Promise<MediaItemRow[]> {
    try {
      const insertQuery = {
        tableName: 'mediaitem',
        columns: [
          DatabaseFunctions.getColumnDefinition('url', 'text', data.url, false),
          DatabaseFunctions.getColumnDefinition('type', 'text', data.type),
          DatabaseFunctions.getColumnDefinition('size', 'integer', data.size),
          DatabaseFunctions.getColumnDefinition('metadata', 'text', data.metadata)
        ]
      };

      const insertionResult = await DatabaseFunctions.dbManager.insert(insertQuery, 'id');

      if (insertionResult.rowCount === 1 && insertionResult.rows[0].hasOwnProperty('id')) {
        const id = insertionResult.rows[0].id;
        const selectResult = await DatabaseFunctions.dbManager.query({
          text: DatabaseFunctions.selectAllStatements.mediaitem + ' where id=$1',
          values: [id]
        });
        this.prepareRows(selectResult.rows);
        return selectResult.rows as MediaItemRow[];
      }
      throw new Error('insertionResult does not have id');
    } catch (e) {
      console.log(e);
      throw new Error('Could not save a new media item.');
    }
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
          text: DatabaseFunctions.selectAllStatements.tool + ' where id=$1',
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

  public static async addTranscript(data: AddTranscriptRequest): Promise<TranscriptRow[]> {
    const startdate = DatabaseFunctions.convertJSONDateTime(data.startdate);
    const enddate = DatabaseFunctions.convertJSONDateTime(data.enddate);
    try {
      const insertQuery = {
        tableName: 'transcript',
        columns: [
          DatabaseFunctions.getColumnDefinition('pid', 'text', data.pid),
          DatabaseFunctions.getColumnDefinition('orgtext', 'text', data.orgtext),
          DatabaseFunctions.getColumnDefinition('transcript', 'text', data.transcript),
          DatabaseFunctions.getColumnDefinition('assessment', 'text', data.assessment),
          DatabaseFunctions.getColumnDefinition('priority', 'integer', data.priority),
          DatabaseFunctions.getColumnDefinition('status', 'text', data.status),
          DatabaseFunctions.getColumnDefinition('code', 'text', data.code),
          DatabaseFunctions.getColumnDefinition('startdate', 'timestamp', startdate),
          DatabaseFunctions.getColumnDefinition('enddate', 'timestamp', enddate),
          DatabaseFunctions.getColumnDefinition('log', 'text', data.log),
          DatabaseFunctions.getColumnDefinition('comment', 'text', data.comment),
          DatabaseFunctions.getColumnDefinition('tool_id', 'integer', data.tool_id),
          DatabaseFunctions.getColumnDefinition('transcriber_id', 'integer', data.transcriber_id),
          DatabaseFunctions.getColumnDefinition('project_id', 'integer', data.project_id),
          DatabaseFunctions.getColumnDefinition('mediaitem_id', 'integer', data.mediaitem_id),
          DatabaseFunctions.getColumnDefinition('nexttranscript_id', 'integer', data.nexttranscript_id)
        ]
      };

      const insertionResult = await DatabaseFunctions.dbManager.insert(insertQuery, 'id');

      if (insertionResult.rowCount === 1 && insertionResult.rows[0].hasOwnProperty('id')) {
        const id = insertionResult.rows[0].id;
        const selectResult = await DatabaseFunctions.dbManager.query({
          text: DatabaseFunctions.selectAllStatements.transcript + ' where id=$1',
          values: [id]
        });
        this.prepareRows(selectResult.rows);
        return selectResult.rows as TranscriptRow[];
      }
      throw new Error('insertionResult does not have id');
    } catch (e) {
      throw e;
    }
  }


  public static async freeAnnotation(projectID: number, transcriptID: number, tokenData: TokenData): Promise<ProjectTranscriptsGetResult> {
    try {
      const selectQuery: SQLQuery = {
        'text': DatabaseFunctions.selectAllStatements.transcript + ` where project_id=$1::integer and id=$2::integer and status='BUSY'`,
        values: [projectID, transcriptID]
      };

      let selectResult = await DatabaseFunctions.dbManager.query(selectQuery);

      if (selectResult.rowCount < 1) {
        throw new Error(`Can not free annotation ${transcriptID} because it either not busy or not found.`);
      }

      const transcriptRow = selectResult.rows[0] as ProjectTranscriptsGetResult;

      // Set transcript status to BUSY and set transcriber_id, set start date, tool_id
      const updateResult = await DatabaseFunctions.dbManager.query({
        text: `update transcript
               set status='FREE',
                   transcriber_id=null
               where id = ${transcriptRow.id}:: integer`
      });

      if (updateResult.rowCount !== 1) {
        throw new Error(`Can not free annotation ${transcriptID}: update failed.`);
      }
      // status set to BUSY

      if (transcriptRow.mediaitem_id) {
        selectResult = await DatabaseFunctions.dbManager.query({
          text: DatabaseFunctions.selectAllStatements.mediaitem + ' where id=$1::integer',
          values: [
            transcriptRow.mediaitem_id
          ]
        });

        if (selectResult.rowCount > 0) {
          // Mediaitem found, add
          const mediaRow = selectResult.rows[0] as MediaItemRow;
          delete mediaRow.id;

          transcriptRow.mediaitem = mediaRow;
          delete transcriptRow.mediaitem_id;
        }
      }

      this.prepareRows([transcriptRow]);

      return transcriptRow;
    } catch (e) {
      throw e;
    }
  }

  public static async startAnnotation(data: StartAnnotationRequest, projectID: number, tokenData: TokenData): Promise<ProjectTranscriptsGetResult> {
    try {
      // TODO check next transcript!
      const insertQuery: SQLQuery = {
        'text': `select transcript.*,
                        (select count(tr.id)
                         from transcript as tr
                         where tr.project_id = transcript.project_id
                           and tr.status = 'FREE')::integer as transcripts_free_count
                 from transcript
                 where project_id = $1::integer
                   and status = 'FREE'
                 order by priority desc`,
        values: [projectID]
      };

      let selectResult = await DatabaseFunctions.dbManager.query(insertQuery);

      if (selectResult.rowCount < 1) {
        return null;
      }

      const transcriptRow = selectResult.rows[0] as ProjectTranscriptsGetResult;

      // Set transcript status to BUSY and set transcriber_id, set start date, tool_id
      const updateResult = await DatabaseFunctions.dbManager.query({
        text: `update transcript
               set status='BUSY',
                   transcriber_id=${tokenData.id}::integer,
                   startdate=(to_timestamp(${Date.now()} / 1000.0))
               where id = ${transcriptRow.id}:: integer`
      });

      if (updateResult.rowCount !== 1) {
        throw new Error(`Can not set status to BUSY of transcript with id ${transcriptRow.id}.`);
      }
      // status set to BUSY

      if (transcriptRow.transcripts_free_count) {
        transcriptRow.transcripts_free_count--;
      }
      if (transcriptRow.mediaitem_id) {
        selectResult = await DatabaseFunctions.dbManager.query({
          text: DatabaseFunctions.selectAllStatements.mediaitem + ' where id=$1::integer',
          values: [
            transcriptRow.mediaitem_id
          ]
        });

        if (selectResult.rowCount > 0) {
          // Mediaitem found, add
          const mediaRow = selectResult.rows[0] as MediaItemRow;
          delete mediaRow.id;

          transcriptRow.mediaitem = mediaRow;
          delete transcriptRow.mediaitem_id;
        }
      }

      this.prepareRows([transcriptRow]);

      return transcriptRow;
    } catch (e) {
      throw e;
    }
  }


  public static async saveAnnotation(data: SaveAnnotationRequest, projectID: number, transcriptID, tokenData: TokenData): Promise<ProjectTranscriptsGetResult> {
    try {
      const insertQuery: SQLQuery = {
        'text': DatabaseFunctions.selectAllStatements.transcript + ` where project_id=$1::integer and id=$2::integer and status='BUSY'`,
        values: [projectID, transcriptID]
      };

      let selectResult = await DatabaseFunctions.dbManager.query(insertQuery);

      if (selectResult.rowCount < 1) {
        throw new Error(`Can not find proper annotation to overwrite.`);
      }

      let transcriptRow = selectResult.rows[0] as ProjectTranscriptsGetResult;

      // Set transcript status to BUSY and set transcriber_id, set start date, tool_id
      const updateResult = await DatabaseFunctions.dbManager.update({
        tableName: 'transcript',
        columns: [
          DatabaseFunctions.getColumnDefinition('transcriber_id', 'integer', tokenData.id, false),
          DatabaseFunctions.getColumnDefinition('enddate', '', `(to_timestamp(${Date.now()} / 1000.0))`, false),
          DatabaseFunctions.getColumnDefinition('tool_id', 'integer', data.tool_id, false),
          DatabaseFunctions.getColumnDefinition('transcript', 'text', JSON.stringify(data.transcript), false),
          DatabaseFunctions.getColumnDefinition('status', 'text', 'ANNOTATED'),
          DatabaseFunctions.getColumnDefinition('comment', 'text', data.comment),
          DatabaseFunctions.getColumnDefinition('assessment', 'text', data.assessment),
          DatabaseFunctions.getColumnDefinition('log', 'text', JSON.stringify(data.log))
        ]
      }, `id=${transcriptRow.id}:: integer`);

      if (updateResult.rowCount !== 1) {
        throw new Error(`Can not save annotation with id ${transcriptRow.id}.`);
      }
      transcriptRow = updateResult.rows[0];
      // saved
      if (transcriptRow.mediaitem_id) {
        selectResult = await DatabaseFunctions.dbManager.query({
          text: DatabaseFunctions.selectAllStatements.mediaitem + ' where id=$1::integer',
          values: [
            transcriptRow.mediaitem_id
          ]
        });

        if (selectResult.rowCount > 0) {
          // Mediaitem found, add
          const mediaRow = selectResult.rows[0] as MediaItemRow;
          delete mediaRow.id;

          transcriptRow.mediaitem = mediaRow;
          delete transcriptRow.mediaitem_id;
        }
      }

      this.prepareRows([transcriptRow]);

      return transcriptRow;
    } catch (e) {
      throw e;
    }
  }

  public static async continueAnnotation(projectID: number, transcriptID: number, tokenData: TokenData): Promise<ProjectTranscriptsGetResult> {
    try {
      const selectQuery: SQLQuery = {
        'text': DatabaseFunctions.selectAllStatements.transcript + ` where project_id=$1::integer and id=$2::integer`,
        values: [projectID, transcriptID]
      };

      let selectResult = await DatabaseFunctions.dbManager.query(selectQuery);

      if (selectResult.rowCount < 1) {
        return null;
      }

      const transcriptRow = selectResult.rows[0] as ProjectTranscriptsGetResult;

      if (transcriptRow.transcriber_id !== tokenData.id) {
        throw new Error(`Can not continue transcript with id ${transcriptRow.id} because the transcriber IDs are not equal.`);
      }

      if (transcriptRow.status !== 'BUSY') {
        throw new Error(`Can not continue transcript with id ${transcriptRow.id} because its status is not equal 'BUSY'`);
      }

      if (transcriptRow.mediaitem_id) {
        selectResult = await DatabaseFunctions.dbManager.query({
          text: DatabaseFunctions.selectAllStatements.mediaitem + ' where id=$1::integer',
          values: [
            transcriptRow.mediaitem_id
          ]
        });

        if (selectResult.rowCount > 0) {
          // Mediaitem found, add
          const mediaRow = selectResult.rows[0] as MediaItemRow;
          delete mediaRow.id;

          transcriptRow.mediaitem = mediaRow;
          delete transcriptRow.mediaitem_id;
        }
      }
      this.prepareRows([transcriptRow]);

      return transcriptRow;
    } catch (e) {
      throw e;
    }
  }

  public static async getTranscriptByID(id: number): Promise<ProjectTranscriptsGetResult> {
    const selectResult = await DatabaseFunctions.dbManager.query({
      text: 'select * from transcript where id=$1::integer',
      values: [id]
    });

    if (selectResult.rowCount === 1) {
      const transcriptRow = (selectResult.rows[0] as TranscriptRow);
      const result: ProjectTranscriptsGetResult = transcriptRow;

      if (transcriptRow.hasOwnProperty('mediaitem_id') && transcriptRow.mediaitem_id) {
        const mediaItemResult = await DatabaseFunctions.dbManager.query({
          text: 'select * from mediaitem where id=$1::integer',
          values: [transcriptRow.mediaitem_id]
        });

        if (mediaItemResult.rowCount === 1) {
          result.mediaitem = mediaItemResult.rows[0] as MediaItemRow;
          DatabaseFunctions.prepareRows([result.mediaitem]);
        }
      }

      DatabaseFunctions.prepareRows([result]);
      return result;
    }
    throw new Error('Could not find a transcript with this ID.')
  }

  public static async getTranscriptsByProjectID(projectID: number): Promise<ProjectTranscriptsGetResult[]> {
    const projectSelectResult = await DatabaseFunctions.dbManager.query({
      text: 'select id from project where id=$1::integer',
      values: [projectID]
    });

    if (projectSelectResult.rowCount === 1) {
      const selectResult = await DatabaseFunctions.dbManager.query({
        text: 'select * from transcript where project_id=$1::integer order by id',
        values: [projectID]
      });

      const results: ProjectTranscriptsGetResult[] = [];
      if (selectResult.rowCount > 0) {
        for (const row of (selectResult.rows as TranscriptRow[])) {
          const mediaItem = await DatabaseFunctions.dbManager.query({
            text: 'select * from mediaitem where id=$1::integer',
            values: [row.mediaitem_id]
          });

          const mediaItemRows = mediaItem.rows as MediaItemRow[];
          const result: ProjectTranscriptsGetResult = {
            ...row
          };

          if (mediaItem.rowCount === 1) {
            result.mediaitem = {
              ...mediaItemRows[0]
            };
            DatabaseFunctions.prepareRows([result.mediaitem]);
          }

          results.push(result);
        }
      }
      DatabaseFunctions.prepareRows(results);
      return results;
    }
    throw new Error(`Can not find a project with ID ${projectID}.`);
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
      text: DatabaseFunctions.selectAllStatements.appToken + ' order by id'
    });
    DatabaseFunctions.prepareRows(selectResult.rows);
    return selectResult.rows as AppTokensRow[];
  }

  static async createUser(userData: {
    name?: string,
    email?: string,
    password: string,
    loginmethod: string
  }): Promise<{
    id: number;
    roles: UserRole[];
  }> {
    const insertAccountQuery = {
      tableName: 'account',
      columns: [
        DatabaseFunctions.getColumnDefinition('username', 'text', userData.name),
        DatabaseFunctions.getColumnDefinition('email', 'text', userData.email),
        DatabaseFunctions.getColumnDefinition('hash', 'text', userData.password),
        DatabaseFunctions.getColumnDefinition('loginmethod', 'text', userData.loginmethod)
      ]
    };
    const insertionResult = await DatabaseFunctions.dbManager.insert(insertAccountQuery, 'id');

    if (insertionResult.rowCount === 1 && insertionResult.rows[0].hasOwnProperty('id')) {
      const id = insertionResult.rows[0].id;

      await DatabaseFunctions.assignUserRolesToUser({
        roles: [UserRole.transcriber],
        accountID: id
      });

      const selectResult = await DatabaseFunctions.dbManager.query({
        text: 'select ac.id::integer, ac.username::text, ac.email::text, ac.loginmethod::text, ac.active::boolean, ac.hash::text, ac.training::text, ac.comment::text, ac.createdate::timestamp, r.label::text as role from account ac full outer join account_role ar ON ac.id=ar.account_id full outer join role r ON r.id=ar.role_id where ac.id=$1::integer',
        values: [
          id
        ]
      });

      if (selectResult.rowCount > 0) {
        DatabaseFunctions.prepareRows(selectResult.rows);
        const roles: UserRole[] = (selectResult.rows as any).map(a => a.role).filter(a => !(a === undefined || a === null));

        return {
          id: selectResult.rows[0].id,
          roles
        };
      }
    }

    throw new Error('Could not create user.');
  }

  static async assignUserRolesToUser(data: AssignUserRoleRequest) {
    const rolesTable = await this.getRoles();

    const queries: SQLQuery[] = [];

    // remove all roles from this account at first
    queries.push({
      text: 'delete from account_role where account_id=$1::integer',
      values: [data.accountID]
    });

    for (const role of data.roles) {
      const roleEntry = rolesTable.find(a => a.label === role);

      if (roleEntry) {
        const roleID = roleEntry.id;
        queries.push({
          text: 'insert into account_role(account_id, role_id) values($1::integer, $2::integer)',
          values: [data.accountID, roleID]
        });
      } else {
        throw new Error(`Could not find role '${role}'`);
      }
    }

    const transactionResult = await DatabaseFunctions.dbManager.transaction(queries);

    if (transactionResult.command === 'COMMIT') {
      return;
    }
    throw new Error('Could not assign role');
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
      text: 'select * from account_role where account_id=$1::integer',
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

  static async listUsers(): Promise<AccountRow[]> {
    const selectResult = await DatabaseFunctions.dbManager.query({
      text: this.selectAllStatements.account + ' order by id'
    });

    const results: any[] = [];
    for (const row of selectResult.rows) {
      const roles = await DatabaseFunctions.getRolesByUserID(row.id);
      delete (row as any).hash;

      const result = {
        ...row,
        roles
      }
      results.push(result);
    }

    DatabaseFunctions.prepareRows(results);

    return results as AccountRow[];
  }

  static async removeUserByID(id: number): Promise<void> {
    const removeResult = await DatabaseFunctions.dbManager.transaction([
      {
        text: 'update transcript set transcriber_id=null where transcriber_id=$1::integer',
        values: [id]
      },
      {
        text: 'update project set admin_id=null where admin_id=$1::integer',
        values: [id]
      },
      {
        text: 'delete from account_role where account_id=$1::integer',
        values: [id]
      },
      {
        text: 'delete from account where id=$1::integer',
        values: [id]
      }
    ]);

    if (removeResult.command !== 'COMMIT') {
      throw new Error(`Could not remove user account.}.`);
    }
    return;
  }

  static async getUserByHash(loginmethod: 'shibboleth' | 'local', hash: string): Promise<boolean> {
    const selectResult = await DatabaseFunctions.dbManager.query({
      text: this.selectAllStatements.account + ' where hash=$1::text and loginmethod=$2::text',
      values: [hash, loginmethod]
    });

    if (selectResult.rowCount === 1) {
      DatabaseFunctions.prepareRows(selectResult.rows);
      return true;
    }

    return false;
  }

  static async getUserInfo(data: {
    name: string;
    email: string;
    hash: string;
  }): Promise<AccountRow> {
    let selectResult = null;

    if (data.name && data.name.trim() !== '') {
      selectResult = await DatabaseFunctions.dbManager.query({
        text: 'select ac.id::integer, ac.username::text, ac.email::text, ac.loginmethod::text, ac.active::boolean, ac.hash::text, ac.training::text, ac.comment::text, ac.createdate::timestamp, r.label::text as role from account ac full outer join account_role ar ON ac.id=ar.account_id full outer join role r ON r.id=ar.role_id where ac.username=$1::text',
        values: [data.name]
      });
    } else if (data.hash && data.hash.trim() !== '') {
      console.log(`get by hash ${data.hash}`);
      selectResult = await DatabaseFunctions.dbManager.query({
        text: 'select ac.id::integer, ac.username::text, ac.email::text, ac.loginmethod::text, ac.active::boolean, ac.hash::text, ac.training::text, ac.comment::text, ac.createdate::timestamp, r.label::text as role from account ac full outer join account_role ar ON ac.id=ar.account_id full outer join role r ON r.id=ar.role_id where ac.hash=$1::text',
        values: [data.hash]
      });
    } else if (data.email && data.email.trim() !== '') {
      selectResult = await DatabaseFunctions.dbManager.query({
        text: 'select ac.id::integer, ac.username::text, ac.email::text, ac.loginmethod::text, ac.active::boolean, ac.hash::text, ac.training::text, ac.comment::text, ac.createdate::timestamp, r.label::text as role from account ac full outer join account_role ar ON ac.id=ar.account_id full outer join role r ON r.id=ar.role_id where ac.email=$1::text',
        values: [data.email]
      });
    }

    if (selectResult) {
      const roles: UserRole[] = (selectResult.rows as any[]).map(a => a.role).filter(a => !(a === undefined || a === null));
      const row = selectResult.rows[0] as AccountRow;
      if (selectResult.rowCount > 0) {
        return {
          ...row,
          role: roles
        };
      }
    }

    return null;
  }


  static async changeUserPassword(id: number, hash: string): Promise<void> {
    const updateResult = await DatabaseFunctions.dbManager.query({
      text: 'update account set hash=$1::text where id=$2::integer returning id',
      values: [hash, id]
    });

    if (updateResult.rowCount === 1) {
      return;
    }

    throw new Error('Can not change password.');
  }


  static async getUserInfoByUserID(id: number): Promise<AccountRow> {
    const selectResult = await DatabaseFunctions.dbManager.query({
      text: 'select ac.id::integer, ac.username::text, ac.email::text, ac.loginmethod::text, ac.active::boolean, ac.hash::text, ac.training::text, ac.comment::text, ac.createdate::timestamp, r.label::text as role from account ac full outer join account_role ar ON ac.id=ar.account_id full outer join role r ON r.id=ar.role_id where ac.id=$1::integer',
      values: [id]
    });

    const role: UserRole[] = (selectResult.rows as any[]).map(a => a.role).filter(a => !(a === undefined || a === null));
    if (selectResult.rowCount > 0) {
      const row = selectResult.rows[0] as AccountRow;
      DatabaseFunctions.prepareRows([row]);
      return {
        ...row,
        role
      };
    }

    throw new Error('could not find user');
  }

  static async deliverNewMedia(dataDeliveryRequest: DeliverNewMediaRequest): Promise<ProjectTranscriptsGetResult> {
    const media = dataDeliveryRequest.media;

    const mediaInsertResult = await DatabaseFunctions.addMediaItem({
      url: media.url,
      type: media.type,
      size: media.size,
      metadata: media.metadata
    });

    if (mediaInsertResult.length > 0) {
      const mediaID = mediaInsertResult[0].id;
      const transcriptResult = await DatabaseFunctions.addTranscript({
        orgtext: dataDeliveryRequest.orgtext,
        transcript: dataDeliveryRequest.transcript,
        project_id: dataDeliveryRequest.project_id,
        mediaitem_id: mediaID,
        status: 'FREE'
      });

      if (transcriptResult.length > 0) {
        const result = transcriptResult[0] as ProjectTranscriptsGetResult;

        const mediaItem = await DatabaseFunctions.dbManager.query({
          text: this.selectAllStatements.mediaitem + ' where id=$1::integer',
          values: [mediaID]
        });

        if (mediaItem.rowCount === 1) {
          result.mediaitem = mediaItem.rows[0] as MediaItemRow;
          DatabaseFunctions.prepareRows([result.mediaitem]);
        }

        DatabaseFunctions.prepareRows([result]);
        return result;
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
            row[col] = DateTime.fromSQL(row[col]).toJSON();
          }
        }
      }
    }
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

}
