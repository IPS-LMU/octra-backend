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
exports.TranscriptAddCommand = void 0;
var api_command_1 = require("../api.command");
var database_functions_1 = require("../../obj/database.functions");
var database_types_1 = require("../../obj/database.types");
var server_codes_1 = require("../../../../obj/http-codes/server.codes");
var client_codes_1 = require("../../../../obj/http-codes/client.codes");
var TranscriptAddCommand = /** @class */ (function (_super) {
    __extends(TranscriptAddCommand, _super);
    function TranscriptAddCommand() {
        var _this = _super.call(this, 'addTranscript', '/transcripts', api_command_1.RequestType.POST, '/', true, [
            database_types_1.UserRole.administrator
        ]) || this;
        _this._description = 'Adds a new empty transcript.';
        _this._acceptedContentType = 'application/json';
        _this._responseContentType = 'application/json';
        // relevant for reference creation
        _this._requestStructure = {
            properties: __assign(__assign({}, _this.defaultRequestSchema.properties), { pid: {
                    type: 'string'
                }, orgtext: {
                    type: 'string'
                }, transcript: {
                    type: 'string'
                }, assessment: {
                    type: 'string'
                }, priority: {
                    type: 'number'
                }, status: {
                    type: 'string'
                }, code: {
                    type: 'string'
                }, creationdate: {
                    type: 'string'
                }, startdate: {
                    type: 'string'
                }, enddate: {
                    type: 'string'
                }, log: {
                    type: 'string'
                }, comment: {
                    type: 'string'
                }, tool_id: {
                    type: 'number'
                }, transcriber_id: {
                    type: 'number'
                }, project_id: {
                    type: 'number'
                }, mediaitem_id: {
                    type: 'number'
                }, nexttranscript_id: {
                    type: 'number'
                } })
        };
        // relevant for reference creation
        _this._responseStructure = {
            properties: __assign(__assign({}, _this.defaultResponseSchema.properties), { data: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'number',
                            required: true
                        },
                        pid: {
                            type: 'string'
                        },
                        orgtext: {
                            type: 'string'
                        },
                        transcript: {
                            type: 'string'
                        },
                        assessment: {
                            type: 'string'
                        },
                        priority: {
                            type: 'number'
                        },
                        status: {
                            type: 'string'
                        },
                        code: {
                            type: 'string'
                        },
                        creationdate: {
                            type: 'string'
                        },
                        startdate: {
                            type: 'string'
                        },
                        enddate: {
                            type: 'string'
                        },
                        log: {
                            type: 'string'
                        },
                        comment: {
                            type: 'string'
                        },
                        tool_id: {
                            type: 'number'
                        },
                        transcriber_id: {
                            type: 'number'
                        },
                        project_id: {
                            type: 'number'
                        },
                        mediaitem_id: {
                            type: 'number'
                        },
                        nexttranscript: {
                            type: 'number'
                        }
                    }
                } })
        };
        return _this;
    }
    TranscriptAddCommand.prototype["do"] = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var answer, validation, body, result, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        answer = api_command_1.ApiCommand.createAnswer();
                        validation = this.validate(req.params, req.body);
                        if (!(validation.length === 0)) return [3 /*break*/, 5];
                        body = req.body;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, database_functions_1.DatabaseFunctions.addTranscript(body)];
                    case 2:
                        result = _a.sent();
                        if (result.length === 1) {
                            answer.data = result[0];
                            this.checkAndSendAnswer(res, answer);
                            return [2 /*return*/];
                        }
                        api_command_1.ApiCommand.sendError(res, server_codes_1.InternalServerError, 'Could not add tool.');
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        console.log(e_1);
                        api_command_1.ApiCommand.sendError(res, server_codes_1.InternalServerError, e_1);
                        return [3 /*break*/, 4];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        api_command_1.ApiCommand.sendError(res, client_codes_1.BadRequest, validation);
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return TranscriptAddCommand;
}(api_command_1.ApiCommand));
exports.TranscriptAddCommand = TranscriptAddCommand;
