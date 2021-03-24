import {ApiCommand, RequestType} from '../api.command';
import {AppConfiguration} from '../../../../obj/app-config/app-config';
import {DatabaseFunctions} from '../../obj/database.functions';
import {DeliverNewMediaRequest} from '../../obj/request.types';
import {UserRole} from '../../obj/database.types';

export class DeliveryMediaAddCommand extends ApiCommand {
    constructor() {
        super('deliverMediaForTranscription', RequestType.POST, '/v1/delivery/media/', true,
            [
                UserRole.administrator,
                UserRole.dataDelivery
            ]
        );

        this._description = 'Delivers one audio url for an given project. The media is going to be transcribed with a Tool e.g. Octra.';
        this._acceptedContentType = 'application/json';
        this._responseContentType = 'application/json';

        // relevant for reference creation
        this._requestStructure = {
            properties: {
                ...this.defaultRequestSchema.properties,
                projectName: {
                    type: 'string',
                    required: true
                },
                media: {
                    required: true,
                    type: 'object',
                    properties: {
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
                },
                orgText: {
                    type: 'string'
                },
                transcript: {
                    type: 'string'
                }
            }
        };

        // relevant for reference creation
        this._responseStructure = {
            ...this.defaultResponseSchema,
            properties: {
                ...this.defaultResponseSchema.properties,
                data: undefined
            }
        };
    }

    async do(req, res, settings: AppConfiguration) {
        const answer = ApiCommand.createAnswer();
        const validation = this.validate(req.params, req.body);

        // do something
        if (validation === '') {
            const body: DeliverNewMediaRequest = req.body;
            try {
                await DatabaseFunctions.deliverNewMedia(body);
                this.checkAndSendAnswer(res, answer);
            } catch (e) {
                console.log(e);
                ApiCommand.sendError(res, 400, e);
            }
        } else {
            ApiCommand.sendError(res, 400, validation);
        }

        return;
    }
}
