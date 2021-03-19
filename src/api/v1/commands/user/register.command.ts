import {ApiCommand} from '../api.command';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import {Express, Router} from 'express';
import {AppConfiguration} from '../../../../obj/app-config/app-config';

export class RegisterCommand extends ApiCommand {

    constructor() {
        super('registerUser', 'POST', '/v1/user/register');

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
                name: {
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
            answer.data = bcrypt.hashSync(req.body.password);

            // TODO create account in database
            answer.auth = true;
            answer.token = jwt.sign({id: 123123},
                settings.api.secret, {
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
