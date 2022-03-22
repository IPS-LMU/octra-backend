import {ApiCommand, RequestType} from '../api.command';
import {DatabaseFunctions} from '../../obj/database.functions';
import {BadRequest} from '../../../../obj/http-codes/client.codes';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {AppTokenListResponse, UserRole} from '@octra/db';
import {ApptokenSchema} from './apptoken.json.schema';

export class AppTokenListCommand extends ApiCommand {
  constructor() {
    super('listAppTokens', '/app', RequestType.GET, '/tokens/', true,
      [
        UserRole.administrator
      ]);

    this._description = 'Returns a list of app tokens';
    this._acceptedContentType = 'application/json';
    this._responseContentType = 'application/json';

    // relevant for reference creation
    this._requestStructure = {};

    // relevant for reference creation
    this._responseStructure = {
      properties: {
        ...this.defaultResponseSchema.properties,
        data: {
          type: 'array',
          items: ApptokenSchema
        }
      }
    };
  }

  async do(req, res) {
    const answer = ApiCommand.createAnswer() as AppTokenListResponse;
    const validation = this.validate(req);

    if (validation.length === 0) {
      try {
        answer.data = await DatabaseFunctions.listAppTokens();
        this.checkAndSendAnswer(res, answer);
      } catch (e) {
        ApiCommand.sendError(res, InternalServerError, e);
      }
    } else {
      ApiCommand.sendError(res, BadRequest, validation);
    }

    return;
  }
}
