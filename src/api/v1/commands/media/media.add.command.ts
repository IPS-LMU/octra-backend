import {ApiCommand, RequestType} from '../api.command';
import {AppConfiguration} from '../../../../obj/app-config/app-config';
import {DatabaseFunctions} from '../../obj/database.functions';
import {AddMediaItemRequest} from '../../obj/request.types';
import {UserRole} from '../../obj/database.types';
import {InternalServerError} from '../../../../obj/htpp-codes/server.codes';
import {BadRequest} from '../../../../obj/htpp-codes/client.codes';

export class MediaAddCommand extends ApiCommand {
    constructor() {
        super('addMediaItem', 'Media', RequestType.POST, '/v1/media/', true,
            [
                UserRole.administrator
            ]);

        this._description = 'Adds a new media item.';
        this._acceptedContentType = 'application/json';
        this._responseContentType = 'application/json';

        // relevant for reference creation
        this._requestStructure = {
            properties: {
                ...this.defaultRequestSchema.properties,
                url: {
                    type: 'string',
                    required: true
                },
                type: {
                    type: 'string'
                },
                size: {
                    type: 'number'
                },
                metadata: {
                    type: 'string'
                }
            }
        };

        // relevant for reference creation
        this._responseStructure = {
            properties: {
                ...this.defaultResponseSchema.properties,
                data: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'number',
                            required: true
                        },
                        url: {
                            type: 'string',
                            required: true
                        },
                        type: {
                            type: 'string'
                        },
                        size: {
                            type: 'number'
                        },
                        metadata: {
                            type: 'string'
                        }
                    }
                }
            }
        };
    }

    async do(req, res, settings: AppConfiguration) {
        const answer = ApiCommand.createAnswer();
        const validation = this.validate(req.params, req.body);

        // do something
        if (validation.length === 0) {
            const body: AddMediaItemRequest = req.body;
            try {
                const result = await DatabaseFunctions.addMediaItem(body);
                if (result.length === 1) {
                    answer.data = result[0];
                    this.checkAndSendAnswer(res, answer);
                }

                ApiCommand.sendError(res, InternalServerError, 'Could not add media item.');
            } catch (e) {
                ApiCommand.sendError(res, InternalServerError, e);
            }
        } else {
            ApiCommand.sendError(res, BadRequest, validation);
        }

        return;
    }
}
