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
exports.UserAssignRolesCommand = void 0;
var api_command_1 = require("../api.command");
var database_functions_1 = require("../../obj/database.functions");
var database_types_1 = require("../../obj/database.types");
var server_codes_1 = require("../../../../obj/http-codes/server.codes");
var client_codes_1 = require("../../../../obj/http-codes/client.codes");
var UserAssignRolesCommand = /** @class */ (function (_super) {
    __extends(UserAssignRolesCommand, _super);
    function UserAssignRolesCommand() {
        var _this = _super.call(this, 'assignUserRoles', '/users', api_command_1.RequestType.POST, '/:id/roles', true, [
            database_types_1.UserRole.administrator
        ]) || this;
        _this._description = 'Assign user role for given account id.';
        _this._acceptedContentType = 'application/json';
        _this._responseContentType = 'application/json';
        // relevant for reference creation
        _this._requestStructure = __assign(__assign({}, _this.defaultRequestSchema), { type: 'object', properties: __assign(__assign({}, _this.defaultRequestSchema.properties), { roles: {
                    type: 'array',
                    items: {
                        type: 'string',
                        "enum": ['administrator', 'transcriber', 'data_delivery', 'project_admin']
                    },
                    required: true
                } }) });
        // relevant for reference creation
        _this._responseStructure = {
            properties: __assign(__assign({}, _this.defaultResponseSchema.properties), { data: undefined })
        };
        return _this;
    }
    UserAssignRolesCommand.prototype["do"] = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var validation, userData, answer, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        validation = this.validate(req.params, req.body);
                        if (!(validation.length === 0)) return [3 /*break*/, 5];
                        userData = req.body;
                        userData.accountID = req.params.id;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        answer = api_command_1.ApiCommand.createAnswer();
                        return [4 /*yield*/, database_functions_1.DatabaseFunctions.assignUserRolesToUser(userData)];
                    case 2:
                        _a.sent();
                        this.checkAndSendAnswer(res, answer, false);
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        console.log(e_1);
                        api_command_1.ApiCommand.sendError(res, server_codes_1.InternalServerError, 'Could not assign user role.', false);
                        return [3 /*break*/, 4];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        api_command_1.ApiCommand.sendError(res, client_codes_1.BadRequest, validation, false);
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return UserAssignRolesCommand;
}(api_command_1.ApiCommand));
exports.UserAssignRolesCommand = UserAssignRolesCommand;
