import {ApiCommand, RequestType} from '../api.command';
import {AppConfiguration} from '../../../../obj/app-config/app-config';
import {DatabaseFunctions} from '../../obj/database.functions';
import {DeliverNewMediaRequest} from '../../obj/request.types';
import {UserRole} from '../../obj/database.types';
import {InternalServerError} from '../../../../obj/htpp-codes/server.codes';
import {BadRequest} from '../../../../obj/htpp-codes/client.codes';

export class DeliveryMediaAddCommand extends ApiCommand {
    constructor() {
        super('deliverMediaForTranscription','/delivery', RequestType.POST, '/media/', true,
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
                project_id: {
                    type: 'number',
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
                orgtext: {
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
                data: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'number',
                            required: true
                        },
                        pid: {
                            type: 'string'
                        },
                        orgtext: {
                            type: 'string'
                        },
                        transcript: {
                            type: 'string'
                        },
                        assessment: {
                            type: 'string'
                        },
                        priority: {
                            type: 'number'
                        },
                        status: {
                            type: 'string'
                        },
                        code: {
                            type: 'string'
                        },
                        creationdate: {
                            type: 'string'
                        },
                        startdate: {
                            type: 'string'
                        },
                        enddate: {
                            type: 'string'
                        },
                        log: {
                            type: 'string'
                        },
                        comment: {
                            type: 'string'
                        },
                        tool_id: {
                            type: 'number'
                        },
                        transcriber_id: {
                            type: 'number'
                        },
                        mediaitem: {
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
                        }
                    }
                }
            }
        };
    }

    async do(req, res) {
        const answer = ApiCommand.createAnswer();
        const validation = this.validate(req.params, req.body);

        // do something
        if (validation.length === 0) {
            const body: DeliverNewMediaRequest = req.body;
            try {
                answer.data = await DatabaseFunctions.deliverNewMedia(body);
                this.checkAndSendAnswer(res, answer);
            } catch (e) {
                console.log(e);
                ApiCommand.sendError(res, InternalServerError, e);
            }
        } else {
            ApiCommand.sendError(res, BadRequest, 'Validation Error of request: ' + validation);
        }

        return;
    }
}
