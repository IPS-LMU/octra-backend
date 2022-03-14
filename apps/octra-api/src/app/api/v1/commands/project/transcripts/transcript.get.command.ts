import {Response} from 'express';
import {ApiCommand, RequestType} from '../../api.command';
import {ProjectTranscriptsGetResponseDataItem, TranscriptGetResponse, UserRole} from '@octra/db';
import {InternRequest} from '../../../obj/types';
import {DatabaseFunctions} from '../../../obj/database.functions';
import {InternalServerError} from '../../../../../obj/http-codes/server.codes';

export class ProjectTranscriptGetCommand extends ApiCommand {
  constructor() {
    super('getProjectTranscript', '/projects', RequestType.GET, '/:project_id/transcripts/:transcript_id', true,
      [
        UserRole.administrator,
        UserRole.projectAdministrator,
        UserRole.dataDelivery
      ]);

    this._description = 'Returns a transcript object by transcript ID and project ID.';
    this._acceptedContentType = 'application/json';
    this._responseContentType = 'application/json';

    // relevant for reference creation
    this._requestStructure = {};

    // relevant for reference creation
    this._responseStructure = {
      properties: {
        ...this.defaultResponseSchema.properties,
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              required: true
            },
            pid: {
              type: 'string'
            },
            orgtext: {
              type: 'string'
            },
            transcript: {
              type: 'object'
            },
            assessment: {
              type: 'string'
            },
            priority: {
              type: 'number'
            },
            status: {
              type: 'string'
            },
            code: {
              type: 'string'
            },
            creationdate: {
              type: 'date-time'
            },
            startdate: {
              type: 'date-time'
            },
            enddate: {
              type: 'date-time'
            },
            log: {
              type: 'array'
            },
            comment: {
              type: 'string'
            },
            tool_id: {
              type: 'number'
            },
            transcriber_id: {
              type: 'number'
            },
            project_id: {
              type: 'number'
            },
            file_id: {
              type: 'number'
            },
            file: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  required: true
                },
                type: {
                  type: 'string'
                },
                size: {
                  type: 'number'
                },
                metadata: {
                  type: 'object'
                }
              }
            },
            nexttranscript: {
              type: 'number'
            }
          }
        }
      }
    };
  }

  async do(req: InternRequest, res: Response) {
    const answer = ApiCommand.createAnswer() as TranscriptGetResponse;
    const validation = this.validate(req);
    // do something
    if (validation.length === 0) {
      try {
        answer.data = await DatabaseFunctions.getTranscriptByID(Number(req.params.transcript_id));
        this.reduceDataForUser(req, answer)
        this.checkAndSendAnswer(res, answer);
        return;
      } catch (e) {
        console.log(e);
        ApiCommand.sendError(res, InternalServerError, e.message);
      }
    } else {
      ApiCommand.sendError(res, InternalServerError, validation);
    }
    return;
  }

  reduceDataForUser(req: InternRequest, answer: TranscriptGetResponse) {
    const tokenData = req.decoded;

    if (!tokenData) {
      console.log(`no token data!`);
      return;
    }

    if (!tokenData.accessRights) {
      console.log(`no roles in token data!`);
      return;
    }

    if (tokenData.accessRights.find(a => a.role === UserRole.dataDelivery && a.project_id === answer.data.project_id)) {
      // is data delivery
      const data = answer.data as ProjectTranscriptsGetResponseDataItem;
      delete data.pid;
      delete data.file_id;
    }
  }
}
