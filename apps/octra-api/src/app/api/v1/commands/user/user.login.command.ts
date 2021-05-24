import {ApiCommand, RequestType} from '../api.command';
import * as jwt from 'jsonwebtoken';
import {DatabaseFunctions} from '../../obj/database.functions';
import {BadRequest} from '../../../../obj/http-codes/client.codes';
import {UserLoginRequest, UserLoginResponse} from '@octra/db';
import {OK} from '../../../../obj/http-codes/success.codes';
import {TokenData} from '../../obj/types';

export class UserLoginCommand extends ApiCommand {

  constructor() {
    super('loginUser', '/users', RequestType.POST, '/login', false,
      []);

    this._description = 'Login a user';
    this._acceptedContentType = 'application/json';
    this._responseContentType = 'application/json';

    // relevant for reference creation
    this._requestStructure = {
      ...this.defaultRequestSchema,
      type: 'object',
      properties: {
        ...this.defaultRequestSchema.properties,
        type: {
          enum: ['shibboleth', 'local']
        },
        name: {
          type: 'string'
        },
        email: {
          type: 'string'
        },
        password: {
          type: 'string'
        }
      }
    };

    // relevant for reference creation
    this._responseStructure = {
      properties: {
        token: {
          type: 'string',
          description: 'JSON Web Token. If type is not "local" and openURL is set, the token can be empty. Otherwise it\'s set.'
        },
        ...this.defaultResponseSchema.properties,
        data: {
          ...this.defaultResponseSchema.properties.data,
          properties: {
            ...this.defaultResponseSchema.properties.data.properties,
            // TODO why is id needed?
            id: {
              type: 'number'
            },
            name: {
              type: 'string'
            },
            openURL: {
              type: 'string'
            }
          }
        }
      }
    };
  }

  async do(req, res) {
    console.log(`IN LOGIN`);
    const validation = this.validate(req.params, req.body);
    const body: UserLoginRequest = req.body;
    console.log(`body is`);
    console.log(req.body);

    if (validation.length === 0) {
      console.log(`validation ok`);
      try {
        const answer = ApiCommand.createAnswer() as UserLoginResponse;
        let authenticated = false;

        if (body.type === 'shibboleth') {
          answer.data = {openURL: this.settings.api.shibboleth.windowURL};
          answer.authenticated = false;
          res.status(OK).send(answer);
          return;
        }

        const userData = await DatabaseFunctions.getUserInfo({
          name: body.name,
          email: body.email,
          hash: ''
        });

        if (userData === null || userData === undefined) {
          ApiCommand.sendError(res, 401, 'Can not find user.', false);
          return;
        }
        const {hash} = userData;
        const passwordIsValid = DatabaseFunctions.getPasswordHash(body.password) === hash;
        if (!passwordIsValid) {
          ApiCommand.sendError(res, 401, 'Invalid password.', false);
          return;
        }
        authenticated = true;

        const {id, username, role} = userData;
        answer.authenticated = authenticated;
        const tokenData: TokenData = {
          id, role
        };
        answer.token = jwt.sign(tokenData, this.settings.api.secret, {
          expiresIn: 86400 // expires in 24 hours
        });
        answer.data = {
          id, name: username
        };
        this.checkAndSendAnswer(res, answer, false);
      } catch (e) {
        console.log(e);
        ApiCommand.sendError(res, 500, e, false);
      }
    } else {
      ApiCommand.sendError(res, BadRequest, validation, false);
    }
    return;
  }
}
