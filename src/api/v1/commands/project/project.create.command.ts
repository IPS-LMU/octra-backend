import {ApiCommand, RequestType} from '../api.command';
import {AppConfiguration} from '../../../../obj/app-config/app-config';
import {DatabaseFunctions} from '../../obj/database.functions';
import {CreateProjectRequest} from '../../obj/request.types';
import {UserRole} from '../../obj/database.types';

export class ProjectCreateCommand extends ApiCommand {
    constructor() {
        super('createProject', RequestType.POST, '/v1/projects/', true,
            [
                UserRole.administrator
            ]);

        this._description = 'Creates a new transcription project.';
        this._acceptedContentType = 'application/json';
        this._responseContentType = 'application/json';

        // relevant for reference creation
        this._requestStructure = {
            properties: {
                ...this.defaultRequestSchema.properties,
                name: {
                    type: 'string',
                    required: true
                },
                shortname: {
                    type: 'string'
                },
                description: {
                    type: 'string'
                },
                configuration: {
                    type: 'json'
                },
                startdate: {
                    type: 'string'
                },
                enddate: {
                    type: 'string'
                },
                active: {
                    type: 'boolean'
                },
                admin_id: {
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
                        name: {
                            type: 'string',
                            required: true
                        },
                        shortname: {
                            type: 'string'
                        },
                        description: {
                            type: 'string'
                        },
                        configuration: {
                            type: 'json'
                        },
                        startdate: {
                            type: 'string'
                        },
                        enddate: {
                            type: 'string'
                        },
                        active: {
                            type: 'boolean'
                        },
                        admin_id: {
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
            const body: CreateProjectRequest = req.body;
            try {
                const result = await DatabaseFunctions.createProject(body);
                if (result.length === 1) {
                    answer.data = result[0];
                    this.checkAndSendAnswer(res, answer);
                }

                ApiCommand.sendError(res, 400, 'Could not create project.');
            } catch (e) {
                ApiCommand.sendError(res, 400, e);
            }
        } else {
            ApiCommand.sendError(res, 400, validation);
        }

        return;
    }
}
