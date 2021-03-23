import {ApiCommand, RequestType} from '../api.command';
import {AppConfiguration} from '../../../../obj/app-config/app-config';
import {DatabaseFunctions} from '../../obj/database.functions';
import {AddMediaItemRequest, AddToolRequest} from '../../obj/request.types';

export class ToolAddCommand extends ApiCommand {
    constructor() {
        super('addTool', RequestType.POST, '/v1/tool/', true);

        this._description = 'Adds a new tool.';
        this._acceptedContentType = 'application/json';
        this._responseContentType = 'application/json';

        // relevant for reference creation
        this._requestStructure = {
            properties: {
                ...this.defaultRequestSchema.properties,
                name: {
                    type: "string",
                    required: true
                },
                version: {
                    type: "string"
                },
                description: {
                    type: "string"
                },
                pid: {
                    type: "string"
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
                        name: {
                            type: "string",
                            required: true
                        },
                        version: {
                            type: "string"
                        },
                        description: {
                            type: "string"
                        },
                        pid: {
                            type: "string"
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
            const body: AddToolRequest = req.body;
            try {
                const result = await DatabaseFunctions.addTool(body);
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
