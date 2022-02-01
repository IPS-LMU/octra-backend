import {ApiCommand, RequestType} from '../api.command';
import {DatabaseFunctions} from '../../obj/database.functions';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../obj/http-codes/client.codes';
import {UserExistsHashResponse} from '@octra/db';

export class UserExistsHashCommand extends ApiCommand {
  constructor() {
    super('existsWithHash', '/users', RequestType.GET, '/hash', false,
      []);

    this._description = 'Returns a boolean if user with the hash exists.';
    this._acceptedContentType = 'application/json';
    this._responseContentType = 'application/json';

    // relevant for reference creation
    this._requestStructure = {
      type: 'object',
      properties: {
        loginmethod: {
          enum: ['shibboleth', 'local'],
          required: true
        },
        hash: {
          type: 'string',
          required: true
        }
      }
    };

    // relevant for reference creation
    this._responseStructure = {
      ...this.defaultRequestSchema,
      properties: {
        ...this.defaultResponseSchema.properties,
        data: {
          type: 'boolean'
        }
      }
    };
  }

  async do(req, res) {
    const answer = ApiCommand.createAnswer() as UserExistsHashResponse;
    const validation = this.validate(req);

    if (validation.length === 0) {
      try {
        answer.data = await DatabaseFunctions.checkUserExistsByHash(req.query.loginmethod, req.query.hash);
        this.checkAndSendAnswer(res, answer, false);
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
