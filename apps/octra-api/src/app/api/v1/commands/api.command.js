"use strict";
exports.__esModule = true;
exports.ApiCommand = exports.RequestType = void 0;
var jsonschema_1 = require("jsonschema");
var functions_1 = require("../../../obj/functions");
var success_codes_1 = require("../../../obj/http-codes/success.codes");
var client_codes_1 = require("../../../obj/http-codes/client.codes");
var RequestType;
(function (RequestType) {
    RequestType["GET"] = "GET";
    RequestType["POST"] = "POST";
    RequestType["PUT"] = "PUT";
    RequestType["DELETE"] = "DELETE";
})(RequestType = exports.RequestType || (exports.RequestType = {}));
var ApiCommand = /** @class */ (function () {
    function ApiCommand(name, root, type, url, needsJWTAuthentication, allowedAccountRoles) {
        this._needsJWTAuthentication = false;
        this._defaultResponseSchema = {
            properties: {
                status: {
                    required: true,
                    type: 'string',
                    "enum": ['success', 'error'],
                    description: '\'error\' or \'success\'. If error, the error message is inserted into message.'
                },
                authenticated: {
                    required: true,
                    type: 'boolean',
                    description: 'checks if user is authenticated'
                },
                message: {
                    required: false,
                    type: 'string',
                    description: 'system message or error message.'
                },
                data: {
                    required: false,
                    description: 'data can be string, number or JSON'
                }
            }
        };
        this._defaultRequestSchema = {
            properties: {}
        };
        this._name = name;
        this._type = type;
        this._url = url;
        this._root = root;
        this._needsJWTAuthentication = needsJWTAuthentication;
        this._allowedUserRoles = allowedAccountRoles;
        this._responseStructure = this._defaultResponseSchema;
    }
    Object.defineProperty(ApiCommand.prototype, "root", {
        get: function () {
            return this._root;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ApiCommand.prototype, "allowedUserRoles", {
        get: function () {
            return this._allowedUserRoles;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ApiCommand.prototype, "needsJWTAuthentication", {
        get: function () {
            return this._needsJWTAuthentication;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ApiCommand.prototype, "defaultRequestSchema", {
        get: function () {
            return this._defaultRequestSchema;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ApiCommand.prototype, "defaultResponseSchema", {
        get: function () {
            return this._defaultResponseSchema;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ApiCommand.prototype, "responseContentType", {
        get: function () {
            return this._responseContentType;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ApiCommand.prototype, "acceptedContentType", {
        get: function () {
            return this._acceptedContentType;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ApiCommand.prototype, "responseStructure", {
        get: function () {
            return this._responseStructure;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ApiCommand.prototype, "requestStructure", {
        get: function () {
            return this._requestStructure;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ApiCommand.prototype, "url", {
        get: function () {
            return this._url;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ApiCommand.prototype, "description", {
        get: function () {
            return this._description;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ApiCommand.prototype, "type", {
        get: function () {
            return this._type;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ApiCommand.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: false,
        configurable: true
    });
    /***
     * creates a default answer
     * @returns {{status: string, data: string, message: string}}
     */
    ApiCommand.createAnswer = function () {
        return {
            status: 'success',
            authenticated: true,
            data: undefined
        };
    };
    ApiCommand.sendError = function (res, code, message, authenticated) {
        if (authenticated === void 0) { authenticated = true; }
        var answer = ApiCommand.createAnswer();
        answer.status = 'error';
        answer.message = message;
        answer.authenticated = authenticated;
        ApiCommand.setSecurityHeaders(res);
        res.status(code).send(answer);
    };
    /***
     * returns information about the command. It's used for the API reference.
     */
    ApiCommand.prototype.getInformation = function () {
        return {
            name: this._name,
            description: this._description,
            url: this._url,
            type: this._type,
            needsJWT: this._needsJWTAuthentication,
            allowedUserRoles: this._allowedUserRoles,
            requestStructure: (this._requestStructure.hasOwnProperty('properties')) ? JSON.stringify(this._requestStructure, null, 2) : undefined,
            responseStructure: (this._responseStructure.hasOwnProperty('properties')) ? JSON.stringify(this._responseStructure, null, 2) : undefined,
            acceptedContentType: this._acceptedContentType,
            responseContentType: 'application/json'
        };
    };
    /***
     * registers command to server
     */
    ApiCommand.prototype.init = function (settings) {
        this.settings = settings;
    };
    /***
     * checks if the request by the client is valid
     * @param params
     * @param body
     * @param query
     */
    ApiCommand.prototype.validate = function (params, body, query) {
        var errors = [];
        var validator = new jsonschema_1.Validator();
        var validationResult = null;
        if (query) {
            validationResult = validator.validate(query, this.requestStructure);
        }
        else {
            validationResult = validator.validate(body, this.requestStructure);
        }
        if (params) {
            var paramsErrors = {
                section: 'URI params',
                errors: []
            };
            for (var attr in params) {
                if (params.hasOwnProperty(attr)) {
                    if (!functions_1.isNumber(params[attr])) {
                        paramsErrors.errors.push(attr + " is not of type number");
                    }
                }
            }
            if (paramsErrors.errors.length > 0) {
                errors.push(paramsErrors);
            }
        }
        if (!validationResult.valid) {
            errors.push({
                section: (query) ? 'GET params' : 'Request payload',
                errors: validationResult.errors.map(function (a) { return a.path.join('.') + ' ' + a.message; })
            });
        }
        return errors;
    };
    ApiCommand.prototype.validateAnswer = function (answer) {
        var errors = [];
        var validator = new jsonschema_1.Validator();
        var validationResult = validator.validate(answer, this._responseStructure);
        if (!validationResult.valid) {
            errors.push({
                section: 'Response payload',
                errors: validationResult.errors.map(function (a) { return a.path.join('.') + ' ' + a.message; })
            });
        }
        return errors;
    };
    ApiCommand.prototype.getUserDataFromTokenObj = function (req) {
        return req.decoded;
    };
    ApiCommand.prototype.checkAndSendAnswer = function (res, answer, authenticated) {
        if (authenticated === void 0) { authenticated = true; }
        var answerValidation = this.validateAnswer(answer);
        ApiCommand.setSecurityHeaders(res);
        if (answerValidation.length === 0) {
            // a user must be authenticated to get an positive answer
            answer.authenticated = true;
            res.status(success_codes_1.OK).send(answer);
        }
        else {
            ApiCommand.sendError(res, client_codes_1.BadRequest, answerValidation, authenticated);
        }
    };
    ApiCommand.setSecurityHeaders = function (res) {
        res.header('Cache-Control', 'no-store')
            .header('Content-Security-Policy', 'frame-ancestors \'none\'')
            .header('Content-Type', 'application/json')
            .header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
            .header('X-Content-Type-Options', 'nosniff')
            .header('X-Frame-Options', 'DENY');
    };
    return ApiCommand;
}());
exports.ApiCommand = ApiCommand;
