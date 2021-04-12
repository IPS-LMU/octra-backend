import {ApiCommand, RequestType} from '../api.command';
import {DatabaseFunctions} from '../../obj/database.functions';
import {UserRole} from '../../obj/database.types';
import {TokenData} from '../../obj/request.types';
import {GetTranscriptsResult} from '../../obj/response.types';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';

export class TranscriptGetCommand extends ApiCommand {
    constructor() {
        super('getTranscript', '/transcripts', RequestType.GET, '/:id', true,
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
                        nexttranscript: {
                            type: 'number'
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
            try {
                answer.data = await DatabaseFunctions.getTranscriptByID(req.params.id);
                this.reduceDataForUser(req, answer)
                this.checkAndSendAnswer(res, answer);
                return;
            } catch (e) {
                console.log(e);
                ApiCommand.sendError(res, InternalServerError, e);
            }
        } else {
            ApiCommand.sendError(res, InternalServerError, validation);
        }
        ApiCommand.sendError(res, InternalServerError, 'nothing happened');
        return;
    }

    reduceDataForUser(req, answer) {
        const tokenData = req.decoded as TokenData;

        if (!tokenData) {
            console.log(`no token data!`);
            return;
        }

        if (!tokenData.role) {
            console.log(`no roles in token data!`);
            return;
        }

        if (tokenData.role.find(a => a === UserRole.dataDelivery)) {
            // is data delivery
            const data = answer.data as GetTranscriptsResult;
            delete data.pid;
            delete data.mediaitem_id;
        }
    }
}