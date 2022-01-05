import {ApiCommand, RequestType} from '../api.command';
import * as jwt from 'jsonwebtoken';
import {DatabaseFunctions} from '../../obj/database.functions';
import {BadRequest, Forbidden} from '../../../../obj/http-codes/client.codes';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {UserRegisterRequest, UserRegisterResponse} from '@octra/db';
import {TokenData} from '../../obj/types';

export class UserRegisterCommand extends ApiCommand {

  constructor() {
    super('registerUser', '/users', RequestType.POST, '/register', false, []);

    this._description = 'Creates an account for a given user.';
    this._acceptedContentType = 'application/json';
    this._responseContentType = 'application/json';

    // relevant for reference creation
    this._requestStructure = {
      ...this.defaultRequestSchema,
      type: 'object',
      properties: {
        ...this.defaultRequestSchema.properties,
        name: {
          required: true,
          type: 'string'
        },
        email: {
          type: 'string'
        },
        password: {
          required: true,
          type: 'string'
        }
      }
    };

    // relevant for reference creation
    this._responseStructure = {
      properties: {
        token: {
          required: true,
          type: 'string',
          description: 'JSON Web Token.'
        },
        ...this.defaultResponseSchema.properties,
        data: {
          ...this.defaultResponseSchema.properties.data,
          properties: {
            ...this.defaultResponseSchema.properties.data.properties,
            id: {
              type: 'number',
              required: true
            }
          }
        }
      }
    };
  }

  async do(req, res) {
    const validation = this.validate(req);

    // do something
    if (validation.length === 0) {
      const userData: UserRegisterRequest = req.body;

      try {
        const answer = ApiCommand.createAnswer() as UserRegisterResponse;

        if (req.AppToken) {
          console.log(`check registrations`);
          const areRegistrationsAllowed = await DatabaseFunctions.areRegistrationsAllowed(req.AppToken);
          const hash = DatabaseFunctions.getPasswordHash(userData.password).toString();

          if (areRegistrationsAllowed) {
            const result = await DatabaseFunctions.createUser({
              name: userData.name,
              email: userData.email,
              password: hash,
              loginmethod: 'local'
            });

            answer.authenticated = true;
            const tokenData: TokenData = {
              id: result.id,
              role: result.roles
            };
            answer.token = jwt.sign(tokenData, this.settings.api.secret, {
              expiresIn: 86400 // expires in 24 hours
            });
            answer.data = {
              id: result.id
            };
            this.checkAndSendAnswer(res, answer, false);
            return;
          }
          ApiCommand.sendError(res, Forbidden, 'Registrations are not allowed.', false);
          return;
        }
        ApiCommand.sendError(res, Forbidden, 'AppToken not found', false);
      } catch (e) {
        console.log(e);
        ApiCommand.sendError(res, InternalServerError, 'Could not create user account.', false);
      }
    } else {
      ApiCommand.sendError(res, BadRequest, validation, false);
    }

    return;
  }
}
