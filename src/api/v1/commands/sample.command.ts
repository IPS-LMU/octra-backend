import {ApiCommand} from './api.command';
import {Express, Router} from 'express';

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
        super('commandName', 'POST', '/v1/commandURI');

        this._description = 'ADD YOUR DESCRIPTION HERE';
        this._acceptedContentType = 'application/json';
        this._responseContentType = 'application/json';

        // relevant for reference creation
        this._requestStructure = {};

        // relevant for reference creation
        this._responseStructure = {
            properties: {
                ...this.defaultResponseSchema.properties
            }
        };
    }

    register(app: Express, router: Router, settings: any) {
        router.route(this.url).post((req, res) => {
            this.do(req, res, settings);
        });
    };

    do(req, res, settings) {
        const answer = ApiCommand.createAnswer();
        const validation = this.validate(req.params, req.body);

        // do something
        if (validation === '') {
            res.status(200).send(answer);
        } else {
            answer.status = 'error';
            answer.message = validation;
            res.status(400).send(answer);
        }
    }
}
