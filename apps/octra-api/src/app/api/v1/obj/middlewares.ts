import {ApiCommand} from '../commands/api.command';
import * as jwt from 'jsonwebtoken';
import {AppConfiguration} from '../../../obj/app-config/app-config';
import {DatabaseFunctions} from './database.functions';
import {UserRole} from '@octra/db';
import {NextFunction, Request, Response} from 'express';
import {InternRequest} from './types';

export const verifyAppToken = (req: InternRequest, res: Response, next: NextFunction, settings: AppConfiguration, callback) => {
  let originHost = req.get('origin')
  let appToken = req.get('Authorization');

  if (appToken) {
    appToken = appToken.replace('Bearer ', '');
    originHost = (originHost) ? originHost = originHost.replace(/:[0-9]{1,5}$/g, '').replace(/^https?:\/\//g, '') : '';
    if (originHost === '') {
      originHost = req.get('host');
    }
    req.AppToken = appToken;

    DatabaseFunctions.isValidAppToken(appToken, originHost).then(() => {
      callback();
    }).catch((error) => {
      console.log(error);
      ApiCommand.sendError(res, 401, `Invalid app token or origin.`, false);
    });
  } else {
    ApiCommand.sendError(res, 403, `Missing 'Authorization' Header.`, false);
  }
};

export const verifyWebToken = (req: Request, res: Response, next: NextFunction, settings: AppConfiguration, command: ApiCommand, callback) => {
  const token = req.get('x-access-token');
  const hasPublicRole = command.allowedUserRoles.findIndex(a => a === UserRole.public) > -1;

  if (!token && !hasPublicRole) {
    ApiCommand.sendError(res, 401, `Missing token in x-access-token header.`, false);
  } else {
    if (token) {
      jwt.verify(token, settings.api.secret, (err, tokenBody) => {
        if (err) {
          ApiCommand.sendError(res, 401, `Invalid Web Token. Please authenticate again.${hasPublicRole} ${command.name}`, false);
        } else {
          callback(tokenBody);
        }
      });
    } else if (hasPublicRole) {
      callback(null);
    } else {
      ApiCommand.sendError(res, 401, `Missing token in x-access-token header.`, false);
    }
  }
}

export const verifyUserRole = (req: InternRequest, res: Response, command: ApiCommand, callback) => {
  const tokenData = req.decoded;
  const hasPublicRole = command.allowedUserRoles.findIndex(a => a === UserRole.public) > -1;

  if (tokenData) {
    if (tokenData.hasOwnProperty('id')) {
      if (command.allowedUserRoles.length > 0) {
        // verify roles
        DatabaseFunctions.getUserInfoByUserID(tokenData.id).then((info) => {
          const foundOne = info.role.find(a => command.allowedUserRoles.findIndex(b => b === a) > -1);

          if (foundOne) {
            callback();
          } else {
            ApiCommand.sendError(res, 401, 'You don\'t have access rights to use this function.');
          }
        }).catch((error) => {
          console.error(error);
          ApiCommand.sendError(res, 401, 'Invalid Web Token. Please authenticate again.', false);
        });
      } else {
        // this command is allowed to all users
        callback();
      }
    }
  } else if (hasPublicRole) {
    callback();
  } else {
    ApiCommand.sendError(res, 401, 'Invalid Web Token. Please authenticate again.', false);
  }
}