import {ApiCommand} from '../api.command';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import {Express, Router} from 'express';
import {AppConfiguration} from '../../../../obj/app-config/app-config';

export class LoginCommand extends ApiCommand {

    constructor() {
        super('loginUser', 'POST', '/v1/user/login', false);

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
                email: {
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
        super.register(app,router, environment, settings, dbManager);
        router.route(this.url).post((req, res) => {
            this.do(req, res, settings);
        });
    };

    do(req, res, settings: AppConfiguration) {
        const answer = ApiCommand.createAnswer();
        const validation = this.validate(req.params, req.body);

        // do something
        if (validation === '') {
            // TODO check if user exists

            const passwordIsValid = bcrypt.compareSync(req.body.password, '$2a$10$b5DTfhUd6Htc3FKkxSa5au/WhCiyyIsOegMac56nGqUzqxLKcm82i');
            if (!passwordIsValid) {
                return res.status(401).send({
                    ...answer,
                    status: 'error',
                    message: 'invalid password',
                    auth: false,
                    token: null
                });
            }

            answer.auth = true;
            answer.token = jwt.sign({id: 123123}, settings.api.secret, {
                expiresIn: 86400 // expires in 24 hours
            });

            res.status(200).send(answer);
        } else {
            answer.status = 'error';
            answer.message = validation;
            res.status(400).send(answer);
        }
    }
}
