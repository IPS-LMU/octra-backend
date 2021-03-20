import {ApiCommand} from '../api.command';
import {Express, Router} from 'express';
import {AppConfiguration} from '../../../../obj/app-config/app-config';
import * as bcrypt from 'bcryptjs';
import {PostgreSQLManager} from '../../../../db/postgreSQL.manager';

export class AppTokenRemoveCommand extends ApiCommand {
    constructor() {
        super('removeAppToken', 'DELETE', '/v1/app/token/:id', true);

        this._description = 'Removes an app token.';
        this._acceptedContentType = 'application/json';
        this._responseContentType = 'application/json';

        // relevant for reference creation
        this._requestStructure = {
            properties: {
                ...this.defaultRequestSchema.properties
            }
        };

        // relevant for reference creation
        this._responseStructure = {
            properties: {
                ...this.defaultResponseSchema.properties,
                data: {
                    properties: {
                        removedRows: {
                            type: 'number'
                        }
                    }
                }
            }
        };
    }

    register(app: Express, router: Router, environment, settings: AppConfiguration,
             dbManager) {
        super.register(app, router, environment, settings, dbManager);
        router.route(this.url).delete((req, res) => {
            this.do(req, res, settings);
        });
    };

    async do(req, res, settings: AppConfiguration) {
        const answer = ApiCommand.createAnswer();
        const validation = this.validate(req.params, req.body);

        // do something
        if (validation === '') {
            if (req.params.hasOwnProperty('id')) {
                try {
                    await this.dbManager.connect();
                    const removeResult = await (this.dbManager as PostgreSQLManager).query({
                        text: 'delete from apptokens where id=$1::numeric',
                        values: [req.params.id]
                    });
                    answer.data = {
                        removedRows: removeResult.rowCount
                    };
                    return res.status(200).send(answer);
                } catch (e){
                    answer.status = 'error';
                    answer.message = e;
                    return res.status(400).send(answer);
                }
            } else {
                answer.status = 'error';
                answer.message = 'Missing id in URI.';
                return res.status(400).send(answer);
            }
        } else {
            answer.status = 'error';
            answer.message = validation;
            return res.status(400).send(answer);
        }
    }

    generateAppToken() {
        return bcrypt.hash(Date.now() + this.settings.api.secret, 8);
    }
}

interface RequestStructure {
    id: number
}
