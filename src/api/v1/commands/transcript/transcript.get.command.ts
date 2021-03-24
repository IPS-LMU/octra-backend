import {ApiCommand, RequestType} from '../api.command';
import {AppConfiguration} from '../../../../obj/app-config/app-config';
import {DatabaseFunctions} from '../../obj/database.functions';
import {UserRole} from '../../obj/database.types';
import {InternalServerError} from '../../../../obj/htpp-codes/server.codes';

export class TranscriptGetCommand extends ApiCommand {
    constructor() {
        super('getTranscript', RequestType.GET, '/v1/transcripts/:id', true,
            [
                UserRole.administrator,
                UserRole.dataDelivery
            ]);

        this._description = 'Returns a transcript object by ID.';
        this._acceptedContentType = 'application/json';
        this._responseContentType = 'application/json';

        // relevant for reference creation
        this._requestStructure = {};

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
        if (validation === '' && req.params && req.params.id) {
            try {
                answer.data = await DatabaseFunctions.getTranscriptByID(req.params.id);
                this.checkAndSendAnswer(res, answer);
                return;
            } catch (e) {
                console.log(e);
                ApiCommand.sendError(res, InternalServerError, e);
            }
        } else {
            ApiCommand.sendError(res, InternalServerError, validation);
        }
        ApiCommand.sendError(res, InternalServerError, "nothing happened");
        return;
    }
}
