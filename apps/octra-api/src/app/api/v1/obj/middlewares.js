"use strict";
exports.__esModule = true;
exports.verifyUserRole = exports.verifyWebToken = exports.verifyAppToken = void 0;
var api_command_1 = require("../commands/api.command");
var jwt = require("jsonwebtoken");
var database_functions_1 = require("./database.functions");
var verifyAppToken = function (req, res, next, settings, callback) {
    var originHost = req.get('origin');
    var appToken = req.get('Authorization');
    if (appToken) {
        appToken = appToken.replace('Bearer ', '');
        originHost = (originHost) ? originHost = originHost.replace(/:[0-9]{1,5}$/g, '').replace(/^https?:\/\//g, '') : '';
        if (originHost === '') {
            originHost = req.get('host');
        }
        req.AppToken = appToken;
        if (appToken === settings.api.authenticator.appToken) {
            // todo check origin header
            // it's a request by an authenticator
            callback();
        }
        else {
            database_functions_1.DatabaseFunctions.isValidAppToken(appToken, originHost).then(function () {
                callback();
            })["catch"](function (error) {
                console.log(error);
                api_command_1.ApiCommand.sendError(res, 401, "Invalid app token or origin.", false);
            });
        }
    }
    else {
        api_command_1.ApiCommand.sendError(res, 403, "Missing 'Authorization' Header.", false);
    }
};
exports.verifyAppToken = verifyAppToken;
var verifyWebToken = function (req, res, next, settings, callback) {
    var token = req.get('x-access-token');
    if (!token) {
        api_command_1.ApiCommand.sendError(res, 401, 'Missing token in x-access-token header.', false);
    }
    else {
        jwt.verify(token, settings.api.secret, function (err, tokenBody) {
            if (err) {
                api_command_1.ApiCommand.sendError(res, 401, 'Invalid Web Token. Please authenticate again.', false);
            }
            else {
                callback(tokenBody);
            }
        });
    }
};
exports.verifyWebToken = verifyWebToken;
var verifyUserRole = function (req, res, command, callback) {
    var tokenData = req.decoded;
    if (tokenData) {
        if (tokenData.hasOwnProperty('id')) {
            if (command.allowedUserRoles.length > 0) {
                // verify roles
                database_functions_1.DatabaseFunctions.getUserInfoByUserID(tokenData.id).then(function (info) {
                    var foundOne = info.role.find(function (a) { return command.allowedUserRoles.findIndex(function (b) { return b === a; }) > -1; });
                    if (foundOne) {
                        callback();
                    }
                    else {
                        api_command_1.ApiCommand.sendError(res, 401, 'You don\'t have access right to use this function.');
                    }
                })["catch"](function (error) {
                    api_command_1.ApiCommand.sendError(res, 401, 'Invalid Web Token. Please authenticate again.', false);
                });
            }
            else {
                // this command is allowed to all users
                callback();
            }
        }
    }
    else {
        api_command_1.ApiCommand.sendError(res, 401, 'Invalid Web Token. Please authenticate again.', false);
    }
};
exports.verifyUserRole = verifyUserRole;
