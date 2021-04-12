import {ApiCommand, RequestType} from '../api.command';
import * as jwt from 'jsonwebtoken';
import {DatabaseFunctions} from '../../obj/database.functions';
import {TokenData, UserRegisterRequest} from '../../obj/request.types';
import {BadRequest, Forbidden} from '../../../../obj/http-codes/client.codes';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {ShibbolethAuthenticator} from '../../../../authenticators/shibboleth/shibboleth.authenticator';

export class UserRegisterCommand extends ApiCommand {

    constructor() {
        super('registerUser', '/users', RequestType.POST, '/register', false, []);

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

    async do(req, res) {
        const validation = this.validate(req.params, req.body);

        // do something
        if (validation.length === 0) {
            const userData: UserRegisterRequest = req.body;

            try {
                const answer = ApiCommand.createAnswer();

                const authenticator = new ShibbolethAuthenticator(this.settings.api.url, req.cookies);

                if (authenticator.isActive) {
                    try {
                        const authenticated = await authenticator.isAuthenticated();
                        if (!authenticated) {
                            UserRegisterCommand.sendError(res, Forbidden, `User not authenticated with ${authenticator.name}`, false);
                            return;
                        }
                    } catch (e) {
                        console.log(`error occurred: `);
                        console.log(e);

                        ApiCommand.sendError(res, InternalServerError, e, false);
                        return;
                    }
                }

                console.log(authenticator);

                if (req.AppToken) {
                    console.log(`check registrations`);
                    let areRegistrationsAllowed;
                    if (this.settings.api.authenticator.appToken === req.AppToken) {
                        areRegistrationsAllowed = true;
                    } else {
                        areRegistrationsAllowed = await DatabaseFunctions.areRegistrationsAllowed(req.AppToken);
                    }
                    const hash = (authenticator.uid === '') ? DatabaseFunctions.getPasswordHash(userData.password).toString() : authenticator.uid;

                    if (areRegistrationsAllowed) {
                        const result = await DatabaseFunctions.createUser({
                            name: userData.name,
                            email: userData.email,
                            password: hash,
                            loginmethod: (authenticator.uid === '') ? 'local' : 'shibboleth'
                        });

                        answer.authenticated = true;
                        const tokenData: TokenData = {
                            id: result.id,
                            role: result.roles
                        };
                        answer.token = jwt.sign(tokenData, this.settings.api.secret, {
                            expiresIn: 86400 // expires in 24 hours
                        });
                        answer.data = {
                            id: result.id
                        };
                        this.checkAndSendAnswer(res, answer, false);
                        return;
                    }
                    ApiCommand.sendError(res, Forbidden, 'Registrations are not allowed.', false);
                    return;
                }
                ApiCommand.sendError(res, Forbidden, 'AppToken not found', false);
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
