import {ApiCommand, RequestType} from '../api.command';
import {DatabaseFunctions} from '../../obj/database.functions';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../obj/http-codes/client.codes';
import {UserRemoveResponse, UserRole} from '@octra/db';

export class UserRemoveCommand extends ApiCommand {
  constructor() {
    super('removeUser', '/users', RequestType.DELETE, '/:id', true,
      [
        UserRole.administrator
      ]);

    this._description = 'Removes a user by id.';
    this._acceptedContentType = 'application/json';
    this._responseContentType = 'application/json';

    // relevant for reference creation
    this._requestStructure = {};

    // relevant for reference creation
    this._responseStructure = {};
  }

  async do(req, res) {
    const answer = ApiCommand.createAnswer() as UserRemoveResponse;
    const validation = this.validate(req.params, req.body);

    if (validation.length === 0) {
      try {
        await DatabaseFunctions.removeUserByID(req.params.id);
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
