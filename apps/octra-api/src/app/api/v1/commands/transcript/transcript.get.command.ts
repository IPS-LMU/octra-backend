import {ApiCommand, RequestType} from '../api.command';
import {DatabaseFunctions} from '../../obj/database.functions';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {TranscriptGetResponse, UserRole} from '@octra/db';
import {InternRequest} from '../../obj/types';
import {Response} from 'express';

export class TranscriptGetCommand extends ApiCommand {
  constructor() {
    super('getTranscript', '/transcripts', RequestType.GET, '/:id', true,
      [
        UserRole.administrator
      ]);

    this._description = 'Returns a transcript object by ID.';
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
              type: 'string'
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
              type: 'string'
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
            mediaitem_id: {
              type: 'number'
            },
            mediaitem: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  required: true
                },
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
                  type: 'string'
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
        answer.data = await DatabaseFunctions.getTranscriptByID(Number(req.params.id));
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
      delete answer.data.pid;
      delete answer.data.file_id;
    }
  }
}
