import {ApiCommand, RequestType} from '../api.command';
import * as jwt from 'jsonwebtoken';
import {Express, Router} from 'express';
import {AppConfiguration} from '../../../../obj/app-config/app-config';
import {SHA256} from 'crypto-js';
import {Database} from '../../obj/database';

export class LoginCommand extends ApiCommand {

    constructor() {
        super('loginUser', RequestType.POST, '/v1/user/login', false);

        this._description = 'Login a user';
        this._acceptedContentType = 'application/json';
        this._responseContentType = 'application/json';

        // relevant for reference creation
        this._requestStructure = {
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
                ...this.defaultResponseSchema.properties
            }
        };
    }

    register(app: Express, router: Router, environment, settings: AppConfiguration,
             dbManager) {
        super.register(app, router, environment, settings, dbManager);
    };

    async do(req, res, settings: AppConfiguration) {
        const validation = this.validate(req.params, req.body);
        const body: RequestStructure = req.body;

        const answer = ApiCommand.createAnswer();

        if (validation === '') {
            try {
                const {password, id} = await Database.getUserPasswordByName(body.name);
                const passwordIsValid = SHA256(body.password).toString() === password;

                if (!passwordIsValid) {
                    ApiCommand.sendError(res, 401, 'Invalid password.');
                }

                answer.auth = true;
                answer.token = jwt.sign({
                    name: body.name,
                    id
                }, settings.api.secret, {
                    expiresIn: 86400 // expires in 24 hours
                });

                res.status(200).send(answer);
            } catch (e) {
                console.log(e);
                ApiCommand.sendError(res, 500, e);
            }
        } else {
            ApiCommand.sendError(res, 400, validation);
        }
        return;
    }
}

interface RequestStructure {
    name: string;
    password: string;
}
