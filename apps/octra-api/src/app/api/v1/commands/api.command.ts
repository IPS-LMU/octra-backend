import {Response} from 'express';
import {Schema, Validator} from 'jsonschema';
import {AppConfiguration} from '../../../obj/app-config/app-config';
import {isEmpty, isNumber} from '../../../obj/functions';
import {OK} from '../../../obj/http-codes/success.codes';
import {BadRequest} from '../../../obj/http-codes/client.codes';
import {UserRole} from '@octra/db';
import {InternRequest} from '../obj/types';

export enum RequestType {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

export abstract class ApiCommand {
  get root(): string {
    return this._root;
  }

  get allowedUserRoles(): UserRole[] {
    return this._allowedUserRoles;
  }

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

  constructor(name: string, root: string, type: RequestType, url: string, needsJWTAuthentication: boolean, allowedAccountRoles: UserRole[]) {
    this._name = name;
    this._type = type;
    this._url = url;
    this._root = root;
    this._needsJWTAuthentication = needsJWTAuthentication;
    this._allowedUserRoles = allowedAccountRoles;

    this._responseStructure = this._defaultResponseSchema;
  }

  private readonly _name: string;
  private readonly _type: RequestType;
  private readonly _url: string;
  protected _description: string;
  protected _acceptedContentType = 'application/json';
  protected _responseContentType = 'application/json';
  protected _requestStructure: Schema;
  protected _responseStructure: Schema;
  protected _needsJWTAuthentication = false;
  protected settings: AppConfiguration;
  protected _tokenData: any;
  protected _allowedUserRoles: UserRole[];
  protected _root: string;

  private readonly _defaultResponseSchema: Schema = {
    properties: {
      status: {
        required: true,
        type: 'string',
        enum: ['success', 'error'],
        description: '\'error\' or \'success\'. If error, the error message is inserted into message.'
      },
      authenticated: {
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
    authenticated: boolean,
    token?: string
  } {
    return {
      status: 'success',
      authenticated: true,
      data: undefined
    };
  }

  static sendError(res: any, code: number, message: any, authenticated: boolean = true) {
    const answer = ApiCommand.createAnswer();
    answer.status = 'error';
    answer.message = message;
    answer.authenticated = authenticated;

    ApiCommand.setSecurityHeaders(res);
    res.status(code).send(answer);
  }

  private static setSecurityHeaders(res: Response) {
    res.header('Cache-Control', 'no-store')
      .header('Content-Security-Policy', 'frame-ancestors \'none\'')
      .header('Content-Type', 'application/json')
      .header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
      .header('X-Content-Type-Options', 'nosniff')
      .header('X-Frame-Options', 'DENY');
  }


  /***
   * returns information about the command. It's used for the API reference.
   */
  public getInformation() {
    return {
      name: this._name,
      description: this._description,
      url: this._url,
      type: this._type,
      needsJWT: this._needsJWTAuthentication,
      allowedUserRoles: this._allowedUserRoles,
      requestStructure: (this._requestStructure.hasOwnProperty('properties')) ? JSON.stringify(this._requestStructure, null, 2) : undefined,
      responseStructure: (this._responseStructure.hasOwnProperty('properties')) ? JSON.stringify(this._responseStructure, null, 2) : undefined,
      acceptedContentType: this._acceptedContentType,
      responseContentType: 'application/json'
    };
  }

  /***
   * registers command to server
   */
  public init(settings: AppConfiguration) {
    this.settings = settings;
  }

  /***
   * runs a command
   * @param req
   * @param res
   */
  abstract do(req: InternRequest, res: Response): Promise<void>;

  /***
   * checks if the request by the client is valid
   * @param req
   */
  validate(req: InternRequest, formData?: any): any[] {
    const errors = [];
    const validator = new Validator();
    let validationResult = null;
    if (req.headers['content-type']?.indexOf('multipart/form-data') === 0) {
      validationResult = validator.validate(formData, this.requestStructure);
    } else if (!isEmpty(req.query)) {
      validationResult = validator.validate(req.query, this.requestStructure);
    } else {
      validationResult = validator.validate(req.body, this.requestStructure);
    }

    if (req.params) {
      const paramsErrors = {
        section: 'URI params',
        errors: []
      };

      for (const attr in req.params) {
        if (req.params.hasOwnProperty(attr)) {
          if (!isNumber(req.params[attr])) {
            paramsErrors.errors.push(`${attr} is not of type number`);
          }
        }
      }
      if (paramsErrors.errors.length > 0) {
        errors.push(paramsErrors);
      }
    }

    if (!validationResult.valid) {
      errors.push({
        section: (req.query && Object.entries(req.query).length > 0) ? 'GET params' : 'Request payload',
        errors: validationResult.errors.map(a => a.path.join('.') + ' ' + a.message)
      });
    }

    return errors;
  }

  validateAnswer(answer) {
    const errors = [];
    const validator = new Validator();
    const validationResult = validator.validate(answer, this._responseStructure);

    if (!validationResult.valid) {
      errors.push({
        section: 'Response payload',
        errors: validationResult.errors.map(a => a.path.join('.') + ' ' + a.message)
      });
    }

    return errors;
  }

  public getUserDataFromTokenObj(req): {
    name: string;
    roles: UserRole[];
    id: number;
  } {
    return req.decoded;
  }

  public checkAndSendAnswer(res: any, answer: any, authenticated = true) {
    const answerValidation = this.validateAnswer(answer);
    const url = res.req.baseUrl;
    ApiCommand.setSecurityHeaders(res);
    if (answerValidation.length === 0) {
      // a user must be authenticated to get an positive answer
      answer.authenticated = true;
      res.status(OK).send(answer);
    } else {
      ApiCommand.sendError(res, BadRequest, answerValidation, authenticated);
    }
  }
}

export interface APICommandGroup {
  parent?: ApiCommand,
  children: ApiCommand[]
}
