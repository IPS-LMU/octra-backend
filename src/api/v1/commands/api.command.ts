import {Express, Router} from 'express';
import {Schema, Validator} from 'jsonschema';
import {AppConfiguration} from '../../../obj/app-config/app-config';
import {DBManager} from '../../../db/DBManager';
import {verifyAppToken, verifyWebToken} from '../obj/middlewares';


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

    get type(): string {
        return this._type;
    }

    get name(): string {
        return this._name;
    }

    private readonly _name: string;
    private readonly _type: string;
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
        auth?: boolean,
        token?: string
    } {
        return {
            status: 'success',
            data: undefined
        };
    }

    static sendError(res, code: number, message: string) {
        const answer = ApiCommand.createAnswer();
        answer.status = 'error';
        answer.message = message;

        res.status(code).send(answer);
    }

    constructor(name: string, type: string, url: string, needsJWTAuthentication: boolean) {
        this._name = name;
        this._type = type;
        this._url = url;
        this._needsJWTAuthentication = needsJWTAuthentication;
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
            requestStructure: JSON.stringify(this.requestStructure, null, 2),
            responseStructure: JSON.stringify(this.responseStructure, null, 2),
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
                    this._tokenData = tokenBody;
                    next();
                });
            });
        }
        this.dbManager = dbManager;
        this.settings = settings;
    }

    /***
     * runs a command
     * @param req
     * @param res
     * @param settings
     */
    abstract do(req, res, settings: any);

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
}
