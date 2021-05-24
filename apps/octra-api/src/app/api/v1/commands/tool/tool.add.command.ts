import {ApiCommand, RequestType} from '../api.command';
import {DatabaseFunctions} from '../../obj/database.functions';
import {BadRequest} from '../../../../obj/http-codes/client.codes';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {AddToolRequest, ToolAddResponse, UserRole} from '@octra/db';

export class ToolAddCommand extends ApiCommand {
  constructor() {
    super('addTool', '/tools', RequestType.POST, '/', true,
      [
        UserRole.administrator
      ]);

    this._description = 'Adds a new tool.';
    this._acceptedContentType = 'application/json';
    this._responseContentType = 'application/json';

    // relevant for reference creation
    this._requestStructure = {
      properties: {
        ...this.defaultRequestSchema.properties,
        name: {
          type: 'string',
          required: true
        },
        version: {
          type: 'string'
        },
        description: {
          type: 'string'
        },
        pid: {
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
            name: {
              type: 'string',
              required: true
            },
            version: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            pid: {
              type: 'string'
            }
          }
        }
      }
    };
  }

  async do(req, res) {
    const answer = ApiCommand.createAnswer() as ToolAddResponse;
    const validation = this.validate(req.params, req.body);

    // do something
    if (validation.length === 0) {
      const body: AddToolRequest = req.body;
      try {
        const result = await DatabaseFunctions.addTool(body);
        if (result.length === 1) {
          answer.data = result[0];
          this.checkAndSendAnswer(res, answer);
          return;
        }

        ApiCommand.sendError(res, InternalServerError, 'Could not add tool.');
      } catch (e) {
        ApiCommand.sendError(res, InternalServerError, e);
      }
    } else {
      ApiCommand.sendError(res, BadRequest, validation);
    }

    return;
  }
}
