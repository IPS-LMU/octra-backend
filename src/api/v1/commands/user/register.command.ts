import {ApiCommand} from '../api.command';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import {Express, Router} from 'express';
import {AppConfiguration} from '../../../../obj/app-config/app-config';
import {Database} from '../../obj/database';

export class RegisterCommand extends ApiCommand {

    constructor() {
        super('registerUser', 'POST', '/v1/user/register', false);

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
                ...this.defaultResponseSchema.properties
            }
        };
    }

    register(app: Express, router: Router, environment, settings: AppConfiguration,
             dbManager) {
        super.register(app, router, environment, settings, dbManager);
        router.route(this.url).post((req, res) => {
            this.do(req, res, settings);
        });
    };

    do(req, res, settings: AppConfiguration) {
        const answer = ApiCommand.createAnswer();
        const validation = this.validate(req.params, req.body);

        // do something
        if (validation === '') {
            const userData: RequestStructure = req.body;


            Database.createUser({
                name: userData.name,
                password: bcrypt.hashSync(userData.password)
            }).then((result: any) => {
                answer.auth = true;
                answer.token = jwt.sign({
                    id: result.id,
                    name: result.username
                }, settings.api.secret, {
                    expiresIn: 86400 // expires in 24 hours
                });
                res.status(200).send(answer);
            }).catch((error) => {
                ApiCommand.sendError(res, 400, "adding user failed");
            });
        } else {
            ApiCommand.sendError(res, 400, validation);
        }
    }
}

interface RequestStructure {
    name: string;
    password: string;
}
