import {ApiCommand} from '../commands/api.command';
import * as jwt from 'jsonwebtoken';
import {AppConfiguration} from '../../../obj/app-config/app-config';
import {Database} from './database';

export const verifyAppToken = (req, res, next) => {
    let appToken = req.get('Authorization');

    if (appToken) {
        appToken = appToken.replace('Bearer ', '');
        const isValidKey = true;

        Database.isValidAppToken(appToken).then(() => {
            next();
        }).catch(() => {
            ApiCommand.sendError(res, 403, 'Invalid app authorization key');
        });

        // TODO check app domain
    } else {
        const answer = ApiCommand.createAnswer();
        answer.status = 'error';
        answer.message = `Missing 'Authorization' Header`;
        res.status(403).json(answer);
    }
};

export const verifyWebToken = (req, res, next, settings: AppConfiguration, callback) => {
    const answer = ApiCommand.createAnswer();
    const token = req.get('x-access-token');
    if (!token) {
        answer.status = 'error';
        answer.message = 'Missing token in x-access-token header.';
        res.status(401).send(answer);
    } else {
        jwt.verify(token, settings.api.secret, (err, tokenBody) => {
            if (err) {
                answer.status = 'error';
                answer.message = 'Invalid Web Token. Please authenticate again.';
                res.status(401).json(answer);
            } else {
                callback(tokenBody);
            }
        });
    }
}
