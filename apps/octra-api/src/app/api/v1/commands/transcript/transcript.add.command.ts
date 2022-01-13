import {ApiCommand, RequestType} from '../api.command';
import {DatabaseFunctions} from '../../obj/database.functions';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../obj/http-codes/client.codes';
import {AddTranscriptRequest, TranscriptAddResponse, UserRole} from '@octra/db';

export class TranscriptAddCommand extends ApiCommand {
  constructor() {
    super('addTranscript (deprecated)', '/transcripts', RequestType.POST, '/', true,
      [
        UserRole.administrator
      ]);

    this._description = 'Adds a new empty transcript.';
    this._acceptedContentType = 'application/json';
    this._responseContentType = 'application/json';

    // relevant for reference creation
    this._requestStructure = {
      properties: {
        ...this.defaultRequestSchema.properties,
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
        nexttranscript_id: {
          type: 'number'
        }
      }
    };

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
            nexttranscript: {
              type: 'number'
            }
          }
        }
      }
    };
  }

  async do(req, res) {
    const answer = ApiCommand.createAnswer() as TranscriptAddResponse;
    const validation = this.validate(req);

    // do something
    if (validation.length === 0) {
      const body: AddTranscriptRequest = req.body;
      try {
        const result = await DatabaseFunctions.addTranscript(body);
        if (result.length === 1) {
          answer.data = result[0];
          this.checkAndSendAnswer(res, answer);
          return;
        }
        ApiCommand.sendError(res, InternalServerError, 'Could not add tool.');
      } catch (e) {
        console.log(e);
        ApiCommand.sendError(res, InternalServerError, e);
      }
    } else {
      ApiCommand.sendError(res, BadRequest, validation);
    }

    return;
  }
}
