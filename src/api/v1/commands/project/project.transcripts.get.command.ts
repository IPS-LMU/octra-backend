import {ApiCommand, RequestType} from '../api.command';
import {AppConfiguration} from '../../../../obj/app-config/app-config';
import {DatabaseFunctions} from '../../obj/database.functions';
import {UserRole} from '../../obj/database.types';
import {InternalServerError} from '../../../../obj/htpp-codes/server.codes';

export class ProjectTranscriptsGetCommand extends ApiCommand {
    constructor() {
        super('getProjectTranscripts', RequestType.GET, '/v1/projects/:id/transcripts', true,
            [
                UserRole.administrator,
                UserRole.dataDelivery
            ]);

        this._description = 'Returns all transcripts of a given project.';
        this._acceptedContentType = 'application/json';
        this._responseContentType = 'application/json';

        // relevant for reference creation
        this._requestStructure = {};

        // relevant for reference creation
        this._responseStructure = {
            properties: {
                ...this.defaultResponseSchema.properties,
                data: {
                    type: 'array',
                    items: {
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
                            project_id: {
                                type: 'number'
                            },
                            mediaitem_id: {
                                type: 'number'
                            },
                            mediaitem: {
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
                            },
                            nexttranscription_id: {
                                type: 'number'
                            }
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
            try {
                answer.data = await DatabaseFunctions.getTranscriptsByProjectID(Number(req.params.id));
                this.checkAndSendAnswer(res, answer);
                return;
            } catch (e) {
                console.log(e);
                ApiCommand.sendError(res, InternalServerError, e);
            }
        } else {
            ApiCommand.sendError(res, InternalServerError, validation);
        }
        return;
    }
}
