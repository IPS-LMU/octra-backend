import {ApiCommand, RequestType} from '../api.command';
import {DatabaseFunctions} from '../../obj/database.functions';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../obj/http-codes/client.codes';
import {AppTokenRefreshResponse, UserRole} from '@octra/db';

export class AppTokenRefreshCommand extends ApiCommand {
  constructor() {
    super('refreshAppToken', '/app', RequestType.PUT, '/tokens/:id/refresh', true,
      [
        UserRole.administrator
      ]);

    this._description = 'Generates a new app token and replaces the old one.';
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
            name: {
              type: 'string',
              required: true
            },
            key: {
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
        }
      }
    };
  }

  async do(req, res) {
    const answer = ApiCommand.createAnswer() as AppTokenRefreshResponse;
    const validation = this.validate(req);

    // do something
    if (validation.length === 0) {
      if (req.params && req.params.id) {
        try {
          answer.data = await DatabaseFunctions.refreshAppToken(req.params.id);
          this.checkAndSendAnswer(res, answer);
        } catch (e) {
          ApiCommand.sendError(res, InternalServerError, e);
        }
      } else {
        ApiCommand.sendError(res, BadRequest, 'Missing app token id.');
      }
    } else {
      ApiCommand.sendError(res, BadRequest, validation);
    }

    return;
  }
}
