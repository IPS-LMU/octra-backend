import {ApiCommand, RequestType} from '../api.command';
import {DatabaseFunctions} from '../../obj/database.functions';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../obj/http-codes/client.codes';
import {AddMediaItemRequest, MediaAddResponse, UserRole} from '@octra/db';

export class MediaAddCommand extends ApiCommand {
  constructor() {
    super('addMediaItem', '/media', RequestType.POST, '/', true,
      [
        UserRole.administrator
      ]);

    this._description = 'Adds a new media item.';
    this._acceptedContentType = 'application/json';
    this._responseContentType = 'application/json';

    // relevant for reference creation
    this._requestStructure = {
      properties: {
        ...this.defaultRequestSchema.properties,
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
    };
  }

  async do(req, res) {
    const answer = ApiCommand.createAnswer() as MediaAddResponse;
    const validation = this.validate(req.params, req.body);

    // do something
    if (validation.length === 0) {
      const body: AddMediaItemRequest = req.body;
      try {
        const result = await DatabaseFunctions.addMediaItem(body);
        if (result.length === 1) {
          answer.data = result[0];
          this.checkAndSendAnswer(res, answer);
          return;
        }

        ApiCommand.sendError(res, InternalServerError, 'Could not add media item.');
      } catch (e) {
        ApiCommand.sendError(res, InternalServerError, e);
      }
    } else {
      ApiCommand.sendError(res, BadRequest, validation);
    }

    return;
  }
}
