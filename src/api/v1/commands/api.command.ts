import {Express, Router} from 'express';
import {Schema, Validator} from 'jsonschema';
import {AppConfiguration} from '../../../obj/app-config/app-config';
import {DBManager} from '../../../db/DBManager';
import {verifyAppToken, verifyWebToken} from '../obj/middlewares';

export enum RequestType {
    GET = 'GET',
    POST = 'POST',
    DELETE = 'DELETE'
}

export abstract class ApiCommand {
    get needsJWTAuthentication(): boolean {
        return this._needsJWTAuthentication;
    }

    get defaultRequestSchema(): Schema {
        return this._defaultRequestSchema;
    }

    get defaultResponseSchema(): Schema {
        return this._defaultResponseSchema;
    }

    get responseContentType(): string {
        return this._responseContentType;
    }

    get acceptedContentType(): string {
        return this._acceptedContentType;
    }

    get responseStructure(): Schema {
        return this._responseStructure;
    }

    get requestStructure(): Schema {
        return this._requestStructure;
    }

    get url(): string {
        return this._url;
    }

    get description(): string {
        return this._description;
    }

    get type(): RequestType {
        return this._type;
    }

    get name(): string {
        return this._name;
    }

    private readonly _name: string;
    private readonly _type: RequestType;
    private readonly _url: string;
    protected _description: string;
    protected _acceptedContentType: string;
    protected _responseContentType: string;
    protected _requestStructure: Schema;
    protected _responseStructure: Schema;
    protected _needsJWTAuthentication = false;
    protected dbManager: DBManager<any>;
    protected settings: AppConfiguration;
    protected _tokenData: any;

    private readonly _defaultResponseSchema: Schema = {
        properties: {
            status: {
                required: true,
                type: 'string',
                enum: ['success', 'error'],
                description: '\'error\' or \'success\'. If error, the error message is inserted into message.'
            },
            auth: {
                required: true,
                type: 'boolean',
                description: 'checks if user is authenticated'
            },
            message: {
                required: false,
                type: 'string',
                description: 'system message or error message.'
            },
            data: {
                required: false,
                description: 'data can be string, number or JSON'
            }
        }
    };

    private readonly _defaultRequestSchema: Schema = {
        properties: {}
    };

    /***
     * creates a default answer
     * @returns {{status: string, data: string, message: string}}
     */
    static createAnswer(): {
        status: 'success' | 'error',
        data: any,
        message?: string,
        auth: boolean,
        token?: string
    } {
        return {
            status: 'success',
            auth: true,
            data: undefined
        };
    }

    static sendError(res, code: number, message: string, authenticated = true) {
        const answer = ApiCommand.createAnswer();
        answer.status = 'error';
        answer.message = message;
        answer.auth = authenticated;

        res.status(code).send(answer);
    }

    constructor(name: string, type: RequestType, url: string, needsJWTAuthentication: boolean) {
        this._name = name;
        this._type = type;
        this._url = url;
        this._needsJWTAuthentication = needsJWTAuthentication;

        this._responseStructure = this._defaultResponseSchema;
    }


    /***
     * returns information about the command. It's used for the API reference.
     */
    public getInformation() {
        return {
            name: this.name,
            description: this.description,
            url: this.url,
            type: this.type,
            requestStructure: (this.requestStructure.hasOwnProperty('properties')) ? JSON.stringify(this.requestStructure, null, 2) : undefined,
            responseStructure: (this.responseStructure.hasOwnProperty('properties')) ? JSON.stringify(this.responseStructure, null, 2) : undefined,
            acceptedContentType: this.acceptedContentType,
            responseContentType: 'application/json'
        };
    }

    /***
     * registers command to server
     */
    public register(app: Express, router: Router, environment: 'production' | 'development', settings: AppConfiguration,
                    dbManager: DBManager<any>) {
        router.use(this.url, verifyAppToken);

        if (this._needsJWTAuthentication) {
            router.use(this.url, (req, res, next) => {
                verifyWebToken(req, res, next, settings, (tokenBody: { name: string, id: number }) => {
                    (req as any).decoded = tokenBody;
                    next();
                });
            });
        }
        this.dbManager = dbManager;
        this.settings = settings;

        const route = router.route(this.url);
        const callback = (req, res) => {
            this.do(req, res, settings);
        };

        switch (this._type) {
            case RequestType.GET:
                route.get(callback);
                break;
            case RequestType.POST:
                route.post(callback);
                break;
            case RequestType.DELETE:
                route.delete(callback);
                break;
        }
    }

    /***
     * runs a command
     * @param req
     * @param res
     * @param settings
     */
    abstract do(req, res, settings: any): Promise<void>;

    /***
     * checks if the request by the client is valid
     * @param params
     * @param body
     */
    validate(params, body) {
        let errors = [];
        const validator = new Validator();
        const validationResult = validator.validate(body, this.requestStructure);
        if (!validationResult.valid) {
            for (const error of validationResult.errors) {
                errors.push(error.stack);
            }
        }

        return errors.join(', ');
    }

    validateAnswer(answer) {
        let errors = [];
        const validator = new Validator();
        const validationResult = validator.validate(answer, this.responseStructure);
        if (!validationResult.valid) {
            for (const error of validationResult.errors) {
                errors.push(error.stack);
            }
        }

        return errors.join(', ');
    }

    public getUserDataFromTokenObj(req): {
        name: string;
        id: number;
    } {
        return req.decoded;
    }

    public checkAndSendAnswer(res: any, answer: any, authenticated = true) {
        const answerValidation = this.validateAnswer(answer);

        if (answerValidation === '') {
            // a user must be authenticated to get an positive answer
            answer.auth = true;
            res.status(200).send(answer);
        } else {
            ApiCommand.sendError(res, 400, `Response validation failed: ${answerValidation}`, authenticated);
        }
    }
}
