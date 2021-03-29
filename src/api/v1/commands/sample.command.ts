import {ApiCommand, RequestType} from './api.command';
import {Express, Router} from 'express';
import {AppConfiguration} from '../../../obj/app-config/app-config';
import {UserRole} from '../obj/database.types';
import {OK} from '../../../obj/htpp-codes/success.codes';
import {InternalServerError} from '../../../obj/htpp-codes/server.codes';

export class SampleCommand extends ApiCommand {
    /*
    Quickstart:
    1. Replace all matches of "SampleCommand" with the new command name.
    2. Change the Method API-URL and Method in the super() call.
    3. Change the description, acceptedContentType attributes.
    4. Change the requestStructure and responseStructure constants.
    5. Open api.module.ts and add your new class instance to the commands array.
     */

    constructor() {
        super('commandName', 'parent', RequestType.POST, '/v1/commandURI', true, [
            UserRole.administrator
        ]);

        this._description = 'ADD YOUR DESCRIPTION HERE';
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
                ...this.defaultResponseSchema.properties
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
        if (validation.length === 0) {
            return res.status(OK).send(answer);
        } else {
            ApiCommand.sendError(res, InternalServerError, validation);
        }

        // it's important if you are using await keyword!
        return;
    }
}
