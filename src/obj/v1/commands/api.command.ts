import {Express, Router} from 'express';

export abstract class ApiCommand {
    get responseContentType(): string {
        return this._responseContentType;
    }

    get acceptedContentType(): string {
        return this._acceptedContentType;
    }

    get responseStructure(): string {
        return this._responseStructure;
    }

    get requestStructure(): string {
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
    protected _requestStructure: string;
    protected _responseStructure: string;

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
            requestStructure: this.requestStructure,
            responseStructure: this.responseStructure,
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
    abstract validate(params, body);
}
