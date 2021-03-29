import {ApiCommand, RequestType} from '../api.command';
import * as jwt from 'jsonwebtoken';
import {AppConfiguration} from '../../../../obj/app-config/app-config';
import {DatabaseFunctions} from '../../obj/database.functions';
import {SHA256} from 'crypto-js';
import {UserRegisterRequest} from '../../obj/request.types';
import {InternalServerError} from '../../../../obj/htpp-codes/server.codes';
import {BadRequest} from '../../../../obj/htpp-codes/client.codes';

export class UserRegisterCommand extends ApiCommand {

    constructor() {
        super('registerUser', 'Users', RequestType.POST, '/v1/users/register', false, []);

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
                auth: {
                    required: false,
                    type: 'boolean',
                    description: 'checks if user is authenticated'
                },
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

    async do(req, res, settings: AppConfiguration) {
        const validation = this.validate(req.params, req.body);

        // do something
        if (validation.length === 0) {
            const userData: UserRegisterRequest = req.body;

            try {
                const answer = ApiCommand.createAnswer();
                const result = await DatabaseFunctions.createUser({
                    name: userData.name,
                    email: userData.email,
                    password:  DatabaseFunctions.getPasswordHash(userData.password).toString()
                });

                answer.authenticated = true;
                answer.token = jwt.sign({
                    id: result.id,
                    name: userData.name,
                    role: result.roles
                }, settings.api.secret, {
                    expiresIn: 86400 // expires in 24 hours
                });
                answer.data = {
                    id: result.id
                };
                this.checkAndSendAnswer(res, answer, false);
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
