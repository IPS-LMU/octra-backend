import {ApiCommand} from '../commands/api.command';
import * as jwt from 'jsonwebtoken';
import {AppConfiguration} from '../../../obj/app-config/app-config';
import {DatabaseFunctions} from './database.functions';
import {UserRole} from '@octra/db';
import {NextFunction, Request, Response} from 'express';
import {InternRequest} from './types';
import {isNumber} from '../../../obj/functions';

export const verifyAppToken = (req: InternRequest, res: Response, next: NextFunction, settings: AppConfiguration, callback) => {
  let originHost = req.get('origin')
  let appToken = req.get('X-App-Token');

  if (appToken) {
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

export const verifyWebToken = (req: Request, res: Response, next: NextFunction, settings: AppConfiguration, allowedUserRoles: UserRole[], callback) => {
  let token = req.get('Authorization');
  const hasPublicRole = allowedUserRoles.findIndex(a => a === UserRole.public) > -1;

  if (!token && !hasPublicRole) {
    ApiCommand.sendError(res, 401, `Missing token in x-access-token header.`, false);
  } else {
    if (token) {
      token = token.replace('Bearer ', '');
      jwt.verify(token, settings.api.secret, (err, tokenBody) => {
        if (err) {
          ApiCommand.sendError(res, 401, `Invalid Web Token. Please authenticate again.`, false);
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
          const foundOnes = info.accessRights.filter(a => command.allowedUserRoles.findIndex(b => {
            return a.role === b;
          }) > -1);

          if (foundOnes.length > 0) {
            if (!foundOnes.find(a => a.role === UserRole.administrator)) {

              if (req.params.project_id && isNumber(req.params.project_id)) {
                const project_id = Number(req.params.project_id);
                const isProjectAdmin = foundOnes.find(a => a.role === UserRole.projectAdministrator && a.project_id === project_id) !== undefined;
                const isTranscriber = foundOnes.find(a => a.role === UserRole.transcriber && a.project_id === project_id) !== undefined;
                const isDataDelivery = foundOnes.find(a => a.role === UserRole.dataDelivery && a.project_id === project_id) !== undefined;

                if (isProjectAdmin || isTranscriber || isDataDelivery) {
                  callback();
                } else {
                  ApiCommand.sendError(res, 401, 'You don\'t have access rights to use this function.');
                }
              } else {
                callback();
              }
            } else {
              callback();
            }
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
