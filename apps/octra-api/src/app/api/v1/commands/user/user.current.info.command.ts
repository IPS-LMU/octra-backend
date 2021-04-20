import {ApiCommand, RequestType} from '../api.command';
import {DatabaseFunctions} from '../../obj/database.functions';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../obj/http-codes/client.codes';
import {TokenData, UserCurrentInfoResponse} from '@octra/db';

export class UserCurrentInfoCommand extends ApiCommand {
  constructor() {
    super('getCurrentUserInformation', '/users', RequestType.GET, '/current', true,
      []);

    this._description = 'Retrieves information about the current user.';
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
            id: {
              type: 'number',
              required: true
            },
            username: {
              type: 'string'
            },
            roles: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            createdate: {
              type: 'string'
            },
            active: {
              type: 'boolean'
            },
            training: {
              type: 'string'
            },
            loginmethod: {
              type: 'boolean'
            },
            comment: {
              type: 'string'
            }
          }
        }
      }
    };
  }

  async do(req, res) {
    const answer = ApiCommand.createAnswer() as UserCurrentInfoResponse;
    const validation = this.validate(req.params, req.body);
    const tokenData: TokenData = req.decoded;

    if (validation.length === 0) {
      if (tokenData) {
        try {
          const result = await DatabaseFunctions.getUserInfoByUserID(tokenData.id);
          if (result.hash) {
            delete result.hash;
          }

          if (result.role) {
            answer.data = {
              ...result,
              roles: result.role
            }
            delete (answer.data as any).role;
          }
          this.checkAndSendAnswer(res, answer);
        } catch (e) {
          console.log(e);
          ApiCommand.sendError(res, InternalServerError, e);
        }
      } else {
        ApiCommand.sendError(res, BadRequest, 'Missing token data.');
      }
    } else {
      ApiCommand.sendError(res, BadRequest, validation);
    }

    return;
  }
}
