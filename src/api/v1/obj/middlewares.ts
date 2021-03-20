import {ApiCommand} from '../commands/api.command';
import * as jwt from 'jsonwebtoken';
import {AppConfiguration} from '../../../obj/app-config/app-config';
import {Database} from './database';

export const verifyAppToken = (req, res, next) => {
    let appToken = req.get('Authorization');

    if (appToken) {
        appToken = appToken.replace('Bearer ', '');
        Database.isValidAppToken(appToken).then(() => {
            next();
        }).catch(() => {
            ApiCommand.sendError(res, 403, 'Invalid app authorization key');
        });

        // TODO check app domain
    } else {
        ApiCommand.sendError(res, 403, `Missing 'Authorization' Header`);
    }
};

export const verifyWebToken = (req, res, next, settings: AppConfiguration, callback) => {
    const answer = ApiCommand.createAnswer();
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
