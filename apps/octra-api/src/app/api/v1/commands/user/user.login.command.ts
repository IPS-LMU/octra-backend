import {ApiCommand, RequestType} from '../api.command';
import * as jwt from 'jsonwebtoken';
import {DatabaseFunctions} from '../../obj/database.functions';
import {BadRequest} from '../../../../obj/http-codes/client.codes';
import {ShibbolethAuthenticator} from '../../../../authenticators/shibboleth/shibboleth.authenticator';
import {OK} from '../../../../obj/http-codes/success.codes';
import {TokenData, UserLoginRequest, UserLoginResponse} from '@octra/db';

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
            id: {
              type: 'number',
              required: true
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
    const validation = this.validate(req.params, req.body);
    const body: UserLoginRequest = req.body;

    if (validation.length === 0) {
      try {
        const answer = ApiCommand.createAnswer() as UserLoginResponse;

        let authenticated = false;
        const authenticator = new ShibbolethAuthenticator(this.settings.api.url, req.cookies);
        const userData = await DatabaseFunctions.getUserInfo({
          name: body.name,
          hash: authenticator.uid
        });

        if (authenticator.isActive || body.type === 'shibboleth') {
          authenticated = await authenticator.isAuthenticated();
          if (userData === null || !authenticated) {
            answer.data = {
              openURL: authenticator.authURL
            };
            answer.status = 'success';
            answer.message = 'Open URL in new window for authentication';
            answer.authenticated = false;
            res.status(OK).send(answer);
            return;
          }
        } else {
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
        }

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
