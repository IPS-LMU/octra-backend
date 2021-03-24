import {ApiCommand, RequestType} from '../api.command';
import {AppConfiguration} from '../../../../obj/app-config/app-config';
import {DatabaseFunctions} from '../../obj/database.functions';
import {UserRole} from '../../obj/database.types';
import {GetProjectTranscriptsRequest} from '../../obj/request.types';

export class ProjectTranscriptsGetCommand extends ApiCommand {
    constructor() {
        super('getProjectTranscripts', RequestType.GET, '/v1/projects/transcripts', true,
            [
                UserRole.administrator,
                UserRole.dataDelivery
            ]);

        this._description = 'Returns all transcripts of a given project..';
        this._acceptedContentType = 'application/json';
        this._responseContentType = 'application/json';

        // relevant for reference creation
        this._requestStructure = {
            ...this.defaultRequestSchema,
            properties: {
                ...this.defaultRequestSchema.properties,
                projectName: {
                    type: 'string',
                    required: true
                }
            }
        };

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
        const body = req.body as GetProjectTranscriptsRequest;
        // do something
        if (validation === '') {
            try {
                answer.data = await DatabaseFunctions.getTranscripstByProjectName(body.projectName);
                this.checkAndSendAnswer(res, answer);
                return;
            } catch (e) {
                console.log(e);
                ApiCommand.sendError(res, 400, e);
            }
        } else {
            ApiCommand.sendError(res, 400, validation);
        }
        ApiCommand.sendError(res, 400, 'nothing happened');
        return;
    }
}
