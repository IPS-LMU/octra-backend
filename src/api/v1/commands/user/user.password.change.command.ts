import {ApiCommand, RequestType} from '../api.command';
import {DatabaseFunctions} from '../../obj/database.functions';
import {TokenData} from '../../obj/request.types';
import {BadRequest} from '../../../../obj/http-codes/client.codes';

export class UserPasswordChangeCommand extends ApiCommand {

    constructor() {
        super('changeMyPassword', '/users', RequestType.PUT, '/password', true, []);

        this._description = 'Changes the password for the person logged in.';
        this._acceptedContentType = 'application/json';
        this._responseContentType = 'application/json';

        // relevant for reference creation
        this._requestStructure = {
            ...this.defaultRequestSchema,
            type: 'object',
            properties: {
                ...this.defaultRequestSchema.properties,
                oldPassword: {
                    required: true,
                    type: 'string'
                },
                password: {
                    required: true,
                    type: 'string'
                }
            }
        };

        // relevant for reference creation
        this._responseStructure = {};
    }

    async do(req, res) {
        const validation = this.validate(req.params, req.body);
        const body: {
            oldPassword: string,
            password: string
        } = req.body;


        if (validation.length === 0) {
            try {
                const tokenBody: TokenData = req.decoded as TokenData;
                if (tokenBody) {
                    const answer = ApiCommand.createAnswer();
                    const userInfo = await DatabaseFunctions.getUserInfoByUserID(tokenBody.id);
                    if (userInfo) {
                        if (userInfo.password === DatabaseFunctions.getPasswordHash(body.oldPassword)) {
                            await DatabaseFunctions.changeUserPassword(tokenBody.id, DatabaseFunctions.getPasswordHash(body.password));
                            this.checkAndSendAnswer(res, answer, true);
                            return;
                        } else {
                            throw 'Old password is wrong.'
                        }
                    }
                }
                throw 'Changing password failed.';
            } catch (e) {
                console.log(e);
                ApiCommand.sendError(res, 500, e, false);
            }
        } else {
            ApiCommand.sendError(res, BadRequest, validation, false);
        }
        return;
    }
}
