import {ApiCommand, RequestType} from '../api.command';
import {Express, Router} from 'express';
import {AppConfiguration} from '../../../../obj/app-config/app-config';
import {DatabaseFunctions} from '../../obj/database.functions';
import {BadRequest} from '../../../../obj/htpp-codes/client.codes';
import {TokenData} from '../../obj/request.types';

export class UserPasswordChangeCommand extends ApiCommand {

    constructor() {
        super('changeMyPassword', 'Users', RequestType.PUT, '/v1/users/password', true, []);

        this._description = 'Changes the password for the person logged in.';
        this._acceptedContentType = 'application/json';
        this._responseContentType = 'application/json';

        // relevant for reference creation
        this._requestStructure = {
            ...this.defaultRequestSchema,
            type: 'object',
            properties: {
                ...this.defaultRequestSchema.properties,
                password: {
                    required: true,
                    type: 'string'
                }
            }
        };

        // relevant for reference creation
        this._responseStructure = {};
    }

    register(app: Express, router: Router, environment, settings: AppConfiguration,
             dbManager) {
        super.register(app, router, environment, settings, dbManager);
    };

    async do(req, res, settings: AppConfiguration) {
        const validation = this.validate(req.params, req.body);
        const body: {
            password: string
        } = req.body;


        if (validation.length === 0) {
            try {
                const tokenBody: TokenData = req.decoded as TokenData;
                if (tokenBody) {
                    const answer = ApiCommand.createAnswer();
                    await DatabaseFunctions.changeUserPassword(tokenBody.id, DatabaseFunctions.getPasswordHash(body.password));

                    this.checkAndSendAnswer(res, answer, true);
                } else {
                    throw 'Changing password failed.';
                }
            } catch (e) {
                console.log(e);
                ApiCommand.sendError(res, 500, e, false);
            }
        } else {
            ApiCommand.sendError(res, BadRequest, validation, false);
        }
        return;
    }
}
