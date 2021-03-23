import {ApiCommand, RequestType} from '../api.command';
import * as jwt from 'jsonwebtoken';
import {Express, Router} from 'express';
import {AppConfiguration} from '../../../../obj/app-config/app-config';
import {DatabaseFunctions} from '../../obj/database.functions';
import {SHA256} from 'crypto-js';

export class UserRegisterCommand extends ApiCommand {

    constructor() {
        super('registerUser', RequestType.POST, '/v1/user/register', false);

        this._description = 'Creates an account for a given user.';
        this._acceptedContentType = 'application/json';
        this._responseContentType = 'application/json';

        // relevant for reference creation
        this._requestStructure = {
            type: 'object',
            anyOf: [
                {
                    required: ['name']
                },
                {
                    required: ['email']
                }
            ],
            properties: {
                ...this.defaultRequestSchema.properties,
                name: {
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
        if (validation === '') {
            const userData: RequestStructure = req.body;
            try {
                const answer = ApiCommand.createAnswer();
                const result = await DatabaseFunctions.createUser({
                    name: userData.name,
                    password: SHA256(userData.password).toString()
                });

                answer.auth = true;
                answer.token = jwt.sign({
                    id: result.id,
                    name: result.username
                }, settings.api.secret, {
                    expiresIn: 86400 // expires in 24 hours
                });
                answer.data = {
                    id: result.id
                };
                this.checkAndSendAnswer(res, answer, false);
            } catch (e) {
                ApiCommand.sendError(res, 400, 'Could not create user account.', false);
            }
        } else {
            ApiCommand.sendError(res, 400, validation, false);
        }

        return;
    }
}

interface RequestStructure {
    name: string;
    password: string;
}
