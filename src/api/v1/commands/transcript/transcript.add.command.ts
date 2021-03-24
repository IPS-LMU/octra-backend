import {ApiCommand, RequestType} from '../api.command';
import {AppConfiguration} from '../../../../obj/app-config/app-config';
import {DatabaseFunctions} from '../../obj/database.functions';
import {AddTranscriptRequest} from '../../obj/request.types';
import {UserRole} from '../../obj/database.types';

export class TranscriptAddCommand extends ApiCommand {
    constructor() {
        super('addTranscript', RequestType.POST, '/v1/transcript/', true,
            [
                UserRole.administrator,
                UserRole.dataDelivery
            ]);

        this._description = 'Adds a new empty transcript.';
        this._acceptedContentType = 'application/json';
        this._responseContentType = 'application/json';

        // relevant for reference creation
        this._requestStructure = {
            properties: {
                ...this.defaultRequestSchema.properties,
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
        };
    }

    async do(req, res, settings: AppConfiguration) {
        const answer = ApiCommand.createAnswer();
        const validation = this.validate(req.params, req.body);

        // do something
        if (validation === '') {
            const body: AddTranscriptRequest = req.body;
            try {
                const result = await DatabaseFunctions.addTranscript(body);
                if (result.length === 1) {
                    answer.data = result[0];
                    this.checkAndSendAnswer(res, answer);
                }

                ApiCommand.sendError(res, 400, 'Could not add tool.');
            } catch (e) {
                ApiCommand.sendError(res, 400, e);
            }
        } else {
            ApiCommand.sendError(res, 400, validation);
        }

        return;
    }
}
