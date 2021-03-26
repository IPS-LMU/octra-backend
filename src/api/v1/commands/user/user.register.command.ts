import {ApiCommand, RequestType} from '../api.command';
import {AppConfiguration} from '../../../../obj/app-config/app-config';
import {UserRegisterRequest} from '../../obj/request.types';
import {InternalServerError} from '../../../../obj/htpp-codes/server.codes';
import {BadRequest} from '../../../../obj/htpp-codes/client.codes';
import * as http from 'http';
import * as https from 'https';
import {SHA256} from 'crypto-js';
import * as jwt from 'jsonwebtoken';
import {DatabaseFunctions} from '../../obj/database.functions';

export class UserRegisterCommand extends ApiCommand {

    constructor() {
        super('registerUser', RequestType.POST, '/v1/users/register', false, []);

        this._description = 'Creates an account for a given user.';
        this._acceptedContentType = 'application/json';
        this._responseContentType = 'application/json';

        // relevant for reference creation
        this._requestStructure = {
            ...this.defaultRequestSchema,
            type: 'object',
            properties: {
                ...this.defaultRequestSchema.properties,
                name: {
                    required: true,
                    type: 'string'
                },
                email: {
                    type: 'string'
                },
                password: {
                    required: true,
                    type: 'string'
                }
            }
        };

        // relevant for reference creation
        this._responseStructure = {
            properties: {
                auth: {
                    required: false,
                    type: 'boolean',
                    description: 'checks if user is authenticated'
                },
                token: {
                    required: true,
                    type: 'string',
                    description: 'JSON Web Token.'
                },
                ...this.defaultResponseSchema.properties,
                data: {
                    ...this.defaultResponseSchema.properties.data,
                    properties: {
                        ...this.defaultResponseSchema.properties.data.properties,
                        id: {
                            type: 'number',
                            required: true
                        }
                    }
                }
            }
        };
    }

    async do(req, res, settings: AppConfiguration) {
        const validation = this.validate(req.params, req.body);

        // do something
        if (validation === '') {
            const userData: UserRegisterRequest = req.body;

            try {
                const answer = ApiCommand.createAnswer();
                const authenticator = {
                    uid: '',
                    cookie: {
                        key: '',
                        value: ''
                    },
                    authenticated: true
                }

                req.cookies = {
                    '_shibsession_234234234234234': "783z284u82u340i234ß"
                };

                if (req.cookies) {
                    for (let attr in req.cookies) {
                        if (req.cookies.hasOwnProperty(attr)) {
                            if (attr.indexOf('_shibsession_') > -1) {
                                authenticator.cookie.key = attr;
                                authenticator.cookie.value = req.cookies[attr];
                                authenticator.uid = attr.replace('_shibsession_', '');
                                break;
                            }
                        }
                    }
                }

                if (authenticator.uid !== '') {
                    const checkAuthentication = () => {
                        return new Promise<boolean>((resolve, reject) => {
                            let ended = false;
                            setTimeout(() => {
                                if (!ended) {
                                    ended = true;
                                    reject('timeout');
                                }
                            }, 3000);

                            const httpClient = (settings.api.url.indexOf('https') > -1) ? https : http;
                            httpClient.get(`${settings.api.url}/authShibboleth`, {
                                headers: {
                                    'Cookie': `${authenticator.cookie.key}=${authenticator.cookie.value}`
                                }
                            }, () => {
                                if (!ended) {
                                    ended = true;
                                    if (res.statusCode > 300 && res.statusCode < 400) {
                                        resolve(false);
                                    } else {
                                        resolve(true);
                                    }
                                }
                            });
                            req.on('error', error => {
                                reject(error)
                            });
                        });
                    };

                    try {
                        authenticator.authenticated = await checkAuthentication();
                        if (authenticator.authenticated) {
                            authenticator.authenticated = true;
                        } else {
                            UserRegisterCommand.sendError(res, InternalServerError, 'Authentication failed', false);
                        }
                    } catch (e) {
                        console.log(`error occurred: `);
                        console.log(e);

                        ApiCommand.sendError(res, InternalServerError, e, false);
                    }
                }

                console.log(authenticator);
                const hash = (authenticator.uid === '') ? SHA256(userData.password).toString() : authenticator.uid;
                const result = await DatabaseFunctions.createUser({
                    name: userData.name,
                    email: userData.email,
                    password: hash,
                    loginmethod: (authenticator.uid === '') ? 'local' : 'shibboleth'
                });

                answer.auth = authenticator.authenticated;
                answer.token = jwt.sign({
                    id: result.id,
                    name: userData.name,
                    role: result.roles
                }, settings.api.secret, {
                    expiresIn: 86400 // expires in 24 hours
                });
                answer.data = {
                    id: result.id,
                    shibID: authenticator.uid
                };
                console.log(result);
                this.checkAndSendAnswer(res, answer, false);
            } catch (e) {
                console.log(e);
                ApiCommand.sendError(res, InternalServerError, 'Could not create user account.', false);
            }
        } else {
            ApiCommand.sendError(res, BadRequest, validation, false);
        }

        return;
    }
}
