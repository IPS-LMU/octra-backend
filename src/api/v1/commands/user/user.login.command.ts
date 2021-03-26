import {ApiCommand, RequestType} from '../api.command';
import * as jwt from 'jsonwebtoken';
import {Express, Router} from 'express';
import {AppConfiguration} from '../../../../obj/app-config/app-config';
import {SHA256} from 'crypto-js';
import {DatabaseFunctions} from '../../obj/database.functions';
import {UserLoginRequest} from '../../obj/request.types';
import {InternalServerError} from '../../../../obj/htpp-codes/server.codes';
import {BadRequest} from '../../../../obj/htpp-codes/client.codes';

export class UserLoginCommand extends ApiCommand {

    constructor() {
        super('loginUser', RequestType.POST, '/v1/users/login', false,
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
                name: {
                    required: true,
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

    register(app: Express, router: Router, environment, settings: AppConfiguration,
             dbManager) {
        super.register(app, router, environment, settings, dbManager);
    };

    async do(req, res, settings: AppConfiguration) {
        const validation = this.validate(req.params, req.body);
        const body: UserLoginRequest = req.body;


        if (validation === '') {
            try {
                const answer = ApiCommand.createAnswer();
                const {password, id, roles} = await DatabaseFunctions.getUserInfoByUserName(body.name);
                const passwordIsValid = SHA256(body.password).toString() === password;

                if (!passwordIsValid) {
                    ApiCommand.sendError(res, 401, 'Invalid password.', false);
                    return;
                }

                // TODO check shibboleth cookie
                // password = shibboleth uid
                // check user name & hash

                // TODO redirect after authentication
                // TODO check authentication

                answer.auth = true;
                answer.token = jwt.sign({
                    name: body.name,
                    id, roles
                }, settings.api.secret, {
                    expiresIn: 86400 // expires in 24 hours
                });
                answer.data = {
                    id: id
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
