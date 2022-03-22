import {ApiCommand, RequestType} from '../api.command';
import {DatabaseFunctions} from '../../obj/database.functions';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../obj/http-codes/client.codes';
import {UserInfoResponse, UserRole} from '@octra/db';
import {UserInfoSchema} from './user.json.schema';

export class UserInfoCommand extends ApiCommand {
  constructor() {
    super('getUserInformation', '/users', RequestType.GET, '/:id', true,
      [
        UserRole.administrator
      ]);

    this._description = 'Retrieves information about a user by id.';
    this._acceptedContentType = 'application/json';
    this._responseContentType = 'application/json';

    // relevant for reference creation
    this._requestStructure = {};

    // relevant for reference creation
    this._responseStructure = {
      properties: {
        ...this.defaultResponseSchema.properties,
        data: UserInfoSchema
      }
    };
  }

  async do(req, res) {
    const answer = ApiCommand.createAnswer() as UserInfoResponse;
    const validation = this.validate(req);

    if (validation.length === 0) {
      try {
        const result = await DatabaseFunctions.getUserInfoByUserID(req.params.id);
        if (result.hash) {
          delete result.hash;
        }

        if (result.accessRights) {
          answer.data = {
            ...result,
            accessRights: result.accessRights
          };
        }

        this.checkAndSendAnswer(res, answer);
      } catch (e) {
        console.log(e);
        ApiCommand.sendError(res, InternalServerError, e);
      }
    } else {
      ApiCommand.sendError(res, BadRequest, validation);
    }
  }
}
