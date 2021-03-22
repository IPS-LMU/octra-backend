import {ApiCommand, RequestType} from '../api.command';
import {Express, Router} from 'express';
import {AppConfiguration} from '../../../../obj/app-config/app-config';
import {Database} from '../../obj/database';

export class AppTokenRemoveCommand extends ApiCommand {
    constructor() {
        super('removeAppToken', RequestType.DELETE, '/v1/app/token/:id', true);

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
    };

    async do(req, res, settings: AppConfiguration) {
        const answer = ApiCommand.createAnswer();
        const validation = this.validate(req.params, req.body);

        // do something
        if (validation === '') {
            if (req.params.hasOwnProperty('id')) {
                try {
                    const removedRows = await Database.removeAppToken(req.params.id);
                    answer.data = {
                        removedRows
                    };
                    res.status(200).send(answer);
                } catch (e) {
                    ApiCommand.sendError(res, 400, e);
                }
            } else {
                ApiCommand.sendError(res, 400, 'Missing id in URI.');
            }
        } else {
            ApiCommand.sendError(res, 400, validation);
        }

        return;
    }
}

interface RequestStructure {
    id: number
}
