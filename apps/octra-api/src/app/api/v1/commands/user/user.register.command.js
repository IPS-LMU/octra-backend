"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.UserRegisterCommand = void 0;
var api_command_1 = require("../api.command");
var jwt = require("jsonwebtoken");
var database_functions_1 = require("../../obj/database.functions");
var client_codes_1 = require("../../../../obj/http-codes/client.codes");
var server_codes_1 = require("../../../../obj/http-codes/server.codes");
var shibboleth_authenticator_1 = require("../../../../authenticators/shibboleth/shibboleth.authenticator");
var UserRegisterCommand = /** @class */ (function (_super) {
    __extends(UserRegisterCommand, _super);
    function UserRegisterCommand() {
        var _this = _super.call(this, 'registerUser', '/users', api_command_1.RequestType.POST, '/register', false, []) || this;
        _this._description = 'Creates an account for a given user.';
        _this._acceptedContentType = 'application/json';
        _this._responseContentType = 'application/json';
        // relevant for reference creation
        _this._requestStructure = __assign(__assign({}, _this.defaultRequestSchema), { type: 'object', properties: __assign(__assign({}, _this.defaultRequestSchema.properties), { name: {
                    required: true,
                    type: 'string'
                }, email: {
                    type: 'string'
                }, password: {
                    required: true,
                    type: 'string'
                } }) });
        // relevant for reference creation
        _this._responseStructure = {
            properties: __assign(__assign({ auth: {
                    required: false,
                    type: 'boolean',
                    description: 'checks if user is authenticated'
                }, token: {
                    required: true,
                    type: 'string',
                    description: 'JSON Web Token.'
                } }, _this.defaultResponseSchema.properties), { data: __assign(__assign({}, _this.defaultResponseSchema.properties.data), { properties: __assign(__assign({}, _this.defaultResponseSchema.properties.data.properties), { id: {
                            type: 'number',
                            required: true
                        } }) }) })
        };
        return _this;
    }
    UserRegisterCommand.prototype["do"] = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var validation, userData, answer, authenticator, authenticated, e_1, areRegistrationsAllowed, hash, result, tokenData, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        validation = this.validate(req.params, req.body);
                        if (!(validation.length === 0)) return [3 /*break*/, 14];
                        userData = req.body;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 12, , 13]);
                        answer = api_command_1.ApiCommand.createAnswer();
                        authenticator = new shibboleth_authenticator_1.ShibbolethAuthenticator(this.settings.api.url, req.cookies);
                        if (!authenticator.isActive) return [3 /*break*/, 5];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, authenticator.isAuthenticated()];
                    case 3:
                        authenticated = _a.sent();
                        if (!authenticated) {
                            UserRegisterCommand.sendError(res, client_codes_1.Forbidden, "User not authenticated with " + authenticator.name, false);
                            return [2 /*return*/];
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _a.sent();
                        console.log("error occurred: ");
                        console.log(e_1);
                        api_command_1.ApiCommand.sendError(res, server_codes_1.InternalServerError, e_1, false);
                        return [2 /*return*/];
                    case 5:
                        console.log(authenticator);
                        if (!req.AppToken) return [3 /*break*/, 11];
                        console.log("check registrations");
                        areRegistrationsAllowed = void 0;
                        if (!(this.settings.api.authenticator.appToken === req.AppToken)) return [3 /*break*/, 6];
                        areRegistrationsAllowed = true;
                        return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, database_functions_1.DatabaseFunctions.areRegistrationsAllowed(req.AppToken)];
                    case 7:
                        areRegistrationsAllowed = _a.sent();
                        _a.label = 8;
                    case 8:
                        hash = (authenticator.uid === '') ? database_functions_1.DatabaseFunctions.getPasswordHash(userData.password).toString() : authenticator.uid;
                        if (!areRegistrationsAllowed) return [3 /*break*/, 10];
                        return [4 /*yield*/, database_functions_1.DatabaseFunctions.createUser({
                                name: userData.name,
                                email: userData.email,
                                password: hash,
                                loginmethod: (authenticator.uid === '') ? 'local' : 'shibboleth'
                            })];
                    case 9:
                        result = _a.sent();
                        answer.authenticated = true;
                        tokenData = {
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
                        return [2 /*return*/];
                    case 10:
                        api_command_1.ApiCommand.sendError(res, client_codes_1.Forbidden, 'Registrations are not allowed.', false);
                        return [2 /*return*/];
                    case 11:
                        api_command_1.ApiCommand.sendError(res, client_codes_1.Forbidden, 'AppToken not found', false);
                        return [3 /*break*/, 13];
                    case 12:
                        e_2 = _a.sent();
                        console.log(e_2);
                        api_command_1.ApiCommand.sendError(res, server_codes_1.InternalServerError, 'Could not create user account.', false);
                        return [3 /*break*/, 13];
                    case 13: return [3 /*break*/, 15];
                    case 14:
                        api_command_1.ApiCommand.sendError(res, client_codes_1.BadRequest, validation, false);
                        _a.label = 15;
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    return UserRegisterCommand;
}(api_command_1.ApiCommand));
exports.UserRegisterCommand = UserRegisterCommand;
