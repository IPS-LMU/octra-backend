import {ApiCommand, RequestType} from '../api.command';
import {DatabaseFunctions} from '../../obj/database.functions';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../obj/http-codes/client.codes';
import {UserListResponse, UserRole} from '@octra/db';

export class UserListCommand extends ApiCommand {
  constructor() {
    super('listUsers', '/users', RequestType.GET, '/', true,
      [
        UserRole.administrator
      ]);

    this._description = 'Returns a list of users.';
    this._acceptedContentType = 'application/json';
    this._responseContentType = 'application/json';

    // relevant for reference creation
    this._requestStructure = {};

    // relevant for reference creation
    this._responseStructure = {
      ...this.defaultRequestSchema,
      properties: {
        ...this.defaultResponseSchema.properties,
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'number',
                required: true
              },
              username: {
                type: 'string',
                required: true
              },
              creationdate: {
                type: 'string',
                required: true
              },
              updatedate: {
                type: 'string',
                required: true
              },
              active: {
                type: 'boolean'
              },
              loginmethod: {
                type: 'string'
              },
              training: {
                type: 'string'
              },
              comment: {
                type: 'string'
              },
              accessRights: {
                type: 'array',
                required: true,
                items: {
                  type: 'object',
                  properties: {
                    role: {
                      type: 'string',
                      required: true
                    },
                    project_id: {
                      type: 'number'
                    },
                    project_name: {
                      type: 'string'
                    },
                    scope: {
                      type: 'string',
                      required: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
  }

  async do(req, res) {
    const answer = ApiCommand.createAnswer() as UserListResponse;
    const validation = this.validate(req);

    if (validation.length === 0) {
      try {
        answer.data = await DatabaseFunctions.listUsers();
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
