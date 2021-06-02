import {ApiCommand, RequestType} from '../api.command';
import {DatabaseFunctions} from '../../obj/database.functions';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../obj/http-codes/client.codes';
import {DeliverNewMediaRequest, DeliveryMediaAddResponse, UserRole} from '@octra/db';

export class DeliveryMediaAddCommand extends ApiCommand {
  constructor() {
    super('deliverMediaForTranscription', '/delivery', RequestType.POST, '/media/', true,
      [
        UserRole.administrator,
        UserRole.dataDelivery
      ]
    );

    this._description = 'Delivers one audio url for an given project. The media is going to be transcribed with a Tool e.g. Octra.';
    this._acceptedContentType = 'application/json';
    this._responseContentType = 'application/json';

    // relevant for reference creation
    this._requestStructure = {
      properties: {
        ...this.defaultRequestSchema.properties,
        project_id: {
          type: 'number',
          required: true
        },
        media: {
          required: true,
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
              type: 'string'
            }
          }
        },
        orgtext: {
          type: 'string'
        },
        transcript: {
          type: 'string'
        }
      }
    };

    // relevant for reference creation
    this._responseStructure = {
      ...this.defaultResponseSchema,
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
            mediaitem: {
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
                  type: 'string'
                }
              }
            }
          }
        }
      }
    };
  }

  async do(req, res) {
    const answer = ApiCommand.createAnswer() as DeliveryMediaAddResponse;
    const validation = this.validate(req.params, req.body);

    // do something
    if (validation.length === 0) {
      const body: DeliverNewMediaRequest = req.body;
      try {
        answer.data = await DatabaseFunctions.deliverNewMedia(body);
        this.checkAndSendAnswer(res, answer);
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