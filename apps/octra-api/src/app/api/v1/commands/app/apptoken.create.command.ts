import {ApiCommand, RequestType} from '../api.command';
import {DatabaseFunctions} from '../../obj/database.functions';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../obj/http-codes/client.codes';
import {AppTokenCreateResponse, CreateAppTokenRequest, UserRole} from '@octra/db';

export class AppTokenCreateCommand extends ApiCommand {
  constructor() {
    super('createAppToken', '/app', RequestType.POST, '/tokens/', true,
      [
        UserRole.administrator
      ]
    );

    this._description = 'Registers an app and returns a new App Token.';
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
        domain: {
          type: 'string'
        },
        description: {
          type: 'string'
        },
        registrations: {
          type: 'boolean'
        }
      }
    };

    // relevant for reference creation
    this._responseStructure = {
      properties: {
        ...this.defaultResponseSchema.properties,
        data: {
          type: 'object',
          required: ['name', 'key'],
          properties: {
            name: {
              type: 'string'
            },
            key: {
              type: 'string'
            },
            domain: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            registrations: {
              type: 'boolean'
            }
          }
        }
      }
    };
  }

  async do(req, res) {
    const answer = ApiCommand.createAnswer() as AppTokenCreateResponse;
    const validation = this.validate(req);

    // do something
    if (validation.length === 0) {
      const body: CreateAppTokenRequest = req.body;
      try {
        const result = await DatabaseFunctions.createAppToken(body);
        if (result.length === 1) {
          answer.data = result[0];

          this.checkAndSendAnswer(res, answer);
          return;
        }
        ApiCommand.sendError(res, InternalServerError, 'Could not create app token.');
      } catch (e) {
        ApiCommand.sendError(res, InternalServerError, e);
      }
    } else {
      ApiCommand.sendError(res, BadRequest, validation);
    }

    return;
  }
}
