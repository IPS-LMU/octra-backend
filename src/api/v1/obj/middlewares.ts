import {ApiCommand} from '../commands/api.command';
import * as jwt from 'jsonwebtoken';
import {AppConfiguration} from '../../../obj/app-config/app-config';
import {DatabaseFunctions} from './database.functions';
import {TokenData} from './request.types';

export const verifyAppToken = (req, res, next) => {
    let originHost = req.get('origin')
    let appToken = req.get('Authorization');

    if (appToken) {
        appToken = appToken.replace('Bearer ', '');
        originHost = (originHost) ? originHost = originHost.replace(/:[0-9]{1,5}$/g, '') : '';

        DatabaseFunctions.isValidAppToken(appToken, originHost).then(() => {
            next();
        }).catch((error) => {
            console.log(error);
            ApiCommand.sendError(res, 401, `Invalid app token.`);
        });
    } else {
        ApiCommand.sendError(res, 403, `Missing 'Authorization' Header.`);
    }

};

export const verifyWebToken = (req, res, next, settings: AppConfiguration, callback) => {
    const token = req.get('x-access-token');
    if (!token) {
        ApiCommand.sendError(res, 401, 'Missing token in x-access-token header.');
    } else {
        jwt.verify(token, settings.api.secret, (err, tokenBody) => {
            if (err) {
                ApiCommand.sendError(res, 401, 'Invalid Web Token. Please authenticate again.');
            } else {
                callback(tokenBody);
            }
        });
    }
}

export const verifyUserRole = (req, res, command: ApiCommand, callback) => {
    const tokenData = req.decoded as TokenData;
    if (tokenData) {
        if (tokenData.hasOwnProperty('id')) {
            if (command.allowedUserRoles.length > 0) {
                // verify roles
                DatabaseFunctions.getUserInfoByUserID(tokenData.id).then((info) => {
                    const foundOne = info.roles.find(a => command.allowedUserRoles.findIndex(b => b === a) > -1);

                    if (foundOne) {
                        callback();
                    } else {
                        ApiCommand.sendError(res, 401, 'You don\'t have access right to use this function.');
                    }
                }).catch((error) => {
                    console.log(error);
                    ApiCommand.sendError(res, 401, 'Invalid Web Token. Please authenticate again.');
                });
            } else {
                // this command is allowed to all users
                callback();
            }
        }
    } else {
        ApiCommand.sendError(res, 401, 'Invalid Web Token. Please authenticate again.');
    }
}
