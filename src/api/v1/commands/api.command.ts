import {Express, Router} from 'express';
import {Schema, Validator} from 'jsonschema';

export abstract class ApiCommand {
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

    private _name: string;
    private _type: string;
    private _url: string;
    protected _description: string;
    protected _acceptedContentType: string;
    protected _responseContentType: string;
    protected _requestStructure: Schema;
    protected _responseStructure: Schema;

    protected readonly defaultResponseSchema: Schema = {
        properties: {
            auth: {
                type: "boolean",
                required: false,
                description: "checks if user is authenticated"
            },
            token: {
                type: 'string',
                required: false,
                description: "JSON webtoken"
            },
            status: {
                type: 'string',
                required: true,
                description: "'error' or 'success'. If error, the error message is inserted into message."
            },
            message: {
                type: 'string',
                required: false,
                description: 'system message or error message.'
            }
        }
    }

    /***
     * checks if the UUID is valid
     * @param uuid
     * @returns {boolean}
     */
    static isValidUUID(uuid) {
        const validRegex = /^[\d\w\-]+$/g;
        return uuid.search(validRegex) > -1;
    }

    /***
     * checks if the itemCode is valid
     * @param uuid
     * @returns {boolean}
     */
    static isValidItemCode(uuid) {
        const validRegex = /^[0-9a-zA-Z]+$/g;
        return uuid.search(validRegex) > -1;
    }

    static isValidFileName(filename) {
        const inValidRegex = /[%/\/\+&]/g;
        return filename.search(inValidRegex) < 0;
    }

    /***
     * creates a default answer
     * @returns {{status: string, data: string, message: string}}
     */
    static createAnswer() {
        return {
            status: 'success',
            auth: false,
            token: '',
            data: '',
            message: ''
        };
    }

    constructor(name: string, type: string, url: string) {
        this._name = name;
        this._type = type;
        this._url = url;
    }

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

    abstract register: (app: Express, router: Router, environment: 'production' | 'development') => void;

    /***
     * runs a command
     * @param req
     * @param res
     */
    abstract do(req, res);

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
