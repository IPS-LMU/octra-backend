import {ApiCommand} from '../commands/api.command';
import * as jwt from 'jsonwebtoken';
import {AppConfiguration} from '../../../obj/app-config/app-config';
import {Database} from './database';

export const verifyAppToken = (req, res, next) => {
    let appToken = req.get('Authorization');
    let originHost = req.get('origin')

    if (originHost) {
        originHost = originHost.replace(/:[0-9]{1,5}$/g, '');
        appToken = appToken.replace('Bearer ', '');

        if (appToken) {
            Database.isValidAppToken(appToken, originHost).then(() => {
                next();
            }).catch((error) => {
                ApiCommand.sendError(res, 401, `Invalid app token.`);
            });
        }
        else {
            ApiCommand.sendError(res, 403, `Missing 'Authorization' Header.`);
        }
    } else {
        ApiCommand.sendError(res, 403, `Missing 'Origin' Header.`);
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
