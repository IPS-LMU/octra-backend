import {ApiCommand} from '../api.command';
import {Express, Router} from 'express';
import {AppConfiguration} from '../../../../obj/app-config/app-config';
import * as bcrypt from 'bcryptjs';

export class AppTokenCreateCommand extends ApiCommand {
    constructor() {
        super('createAppToken', 'POST', '/v1/app/token/');

        this._description = 'Registers an app and returns a new App Token.';
        this._acceptedContentType = 'application/json';
        this._responseContentType = 'application/json';

        // relevant for reference creation
        this._requestStructure = {
            properties: {
                ...this.defaultRequestSchema.properties,
                name: {
                    type: 'string',
                    required: true
                },
                domain: {
                    type: 'string'
                },
                description: {
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
        super.register(app, router, environment, settings, dbManager);
        router.route(this.url).post((req, res) => {
            this.do(req, res, settings);
        });
    };

    async do(req, res, settings: AppConfiguration) {
        const answer = ApiCommand.createAnswer();
        const validation = this.validate(req.params, req.body);

        // do something
        if (validation === '') {
            const body: RequestStructure = req.body;
            try {
                await this.dbManager.connect();
                let token = await this.generateAppToken();
                token = token.substring(0, 20);
                const insertionResult = await this.dbManager.query({
                    text: 'insert into apptokens(name, key, domain, description) values($1::text, $2::text, $3::text, $4::text) returning id',
                    values: [body.name, token, body.domain, body.description]
                });
                if (insertionResult.rows.length === 1 && insertionResult.rows[0].hasOwnProperty('id')) {
                    const selectResult = await this.dbManager.query({
                        text: 'select * from apptokens where id=$1::numeric',
                        values: [insertionResult.rows[0].id]
                    });
                    if (selectResult.rows.length === 1) {
                        answer.data = selectResult.rows[0];
                    }
                    res.status(200).send(answer);
                }
            } catch (e) {
                console.log(e);
                answer.status = 'error';
                answer.message = e;
                res.status(400).send(answer);
            }
        } else {
            answer.status = 'error';
            answer.message = validation;
            res.status(400).send(answer);
        }
    }

    generateAppToken() {
        return bcrypt.hash(Date.now() + this.settings.api.secret, 8);
    }
}

interface RequestStructure {
    name: string;
    key: string;
    domain?: string;
    description?: string;
}
