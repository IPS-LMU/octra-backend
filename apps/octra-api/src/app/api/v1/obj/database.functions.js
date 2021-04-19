"use strict";
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
exports.DatabaseFunctions = void 0;
var crypto_1 = require("crypto");
var database_types_1 = require("./database.types");
var crypto_js_1 = require("crypto-js");
var DatabaseFunctions = /** @class */ (function () {
    function DatabaseFunctions() {
    }
    DatabaseFunctions.init = function (_dbManager, settings) {
        DatabaseFunctions.dbManager = _dbManager;
        DatabaseFunctions.settings = settings;
    };
    DatabaseFunctions.isValidAppToken = function (token, originHost) {
        return __awaiter(this, void 0, void 0, function () {
            var selectResult, resultRow, domainEntry, valid, domains;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, DatabaseFunctions.dbManager.query({
                            text: DatabaseFunctions.selectAllStatements.appToken + ' where key=$1::text',
                            values: [token]
                        })];
                    case 1:
                        selectResult = _a.sent();
                        if (selectResult.rowCount === 1) {
                            resultRow = selectResult.rows[0];
                            // console.log(`check ${resultRow.domain} === ${originHost}`);
                            if (resultRow.hasOwnProperty('domain') && resultRow.domain) {
                                domainEntry = resultRow.domain.replace(/\s+/g, '');
                                if (domainEntry !== '') {
                                    valid = void 0;
                                    if (resultRow.domain.indexOf(',') > -1) {
                                        domains = domainEntry.split(',');
                                        valid = domains.filter(function (a) { return a !== ''; }).findIndex(function (a) { return a === originHost; }) > -1;
                                    }
                                    else {
                                        // one domain
                                        valid = resultRow.domain.trim() === originHost;
                                    }
                                    if (valid) {
                                        return [2 /*return*/];
                                    }
                                    else {
                                        throw "Origin Host " + originHost + " does not match the domain registered for this app key.";
                                    }
                                }
                            }
                            return [2 /*return*/];
                        }
                        throw 'Could not find app token';
                }
            });
        });
    };
    DatabaseFunctions.areRegistrationsAllowed = function (appToken) {
        return __awaiter(this, void 0, void 0, function () {
            var selectResult, resultRow;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, DatabaseFunctions.dbManager.query({
                            text: DatabaseFunctions.selectAllStatements.appToken + ' where key=$1::text',
                            values: [appToken]
                        })];
                    case 1:
                        selectResult = _a.sent();
                        if (selectResult.rowCount === 1) {
                            resultRow = selectResult.rows[0];
                            return [2 /*return*/, resultRow.registrations];
                        }
                        throw 'Could not check if registrations are allowed';
                }
            });
        });
    };
    DatabaseFunctions.createAppToken = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var token, insertQuery, insertionResult, id, selectResult, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, DatabaseFunctions.generateAppToken()];
                    case 1:
                        token = _a.sent();
                        insertQuery = {
                            tableName: 'apptoken',
                            columns: [
                                DatabaseFunctions.getColumnDefinition('name', 'text', data.name, false),
                                DatabaseFunctions.getColumnDefinition('key', 'text', token, false),
                                DatabaseFunctions.getColumnDefinition('domain', 'text', data.domain),
                                DatabaseFunctions.getColumnDefinition('description', 'text', data.description),
                                DatabaseFunctions.getColumnDefinition('registrations', 'boolean', data.registrations)
                            ]
                        };
                        return [4 /*yield*/, DatabaseFunctions.dbManager.insert(insertQuery, 'id')];
                    case 2:
                        insertionResult = _a.sent();
                        if (!(insertionResult.rowCount === 1 && insertionResult.rows[0].hasOwnProperty('id'))) return [3 /*break*/, 4];
                        id = insertionResult.rows[0].id;
                        return [4 /*yield*/, DatabaseFunctions.dbManager.query({
                                text: DatabaseFunctions.selectAllStatements.appToken + ' where id=$1',
                                values: [id]
                            })];
                    case 3:
                        selectResult = _a.sent();
                        DatabaseFunctions.prepareRows(selectResult.rows);
                        return [2 /*return*/, selectResult.rows];
                    case 4: throw 'insertionResult does not have id';
                    case 5:
                        e_1 = _a.sent();
                        console.log(e_1);
                        throw 'could not generate and save app token';
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseFunctions.changeAppToken = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var updateQuery, updateResult, selectResult, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        updateQuery = {
                            tableName: 'apptoken',
                            columns: [
                                DatabaseFunctions.getColumnDefinition('name', 'text', data.name, false),
                                DatabaseFunctions.getColumnDefinition('domain', 'text', data.domain),
                                DatabaseFunctions.getColumnDefinition('description', 'text', data.description),
                                DatabaseFunctions.getColumnDefinition('registrations', 'boolean', data.registrations)
                            ]
                        };
                        return [4 /*yield*/, DatabaseFunctions.dbManager.update(updateQuery, "id=" + data.id + "::integer")];
                    case 1:
                        updateResult = _a.sent();
                        if (!(updateResult.rowCount === 1)) return [3 /*break*/, 3];
                        return [4 /*yield*/, DatabaseFunctions.dbManager.query({
                                text: DatabaseFunctions.selectAllStatements.appToken + ' where id=$1::integer',
                                values: [data.id]
                            })];
                    case 2:
                        selectResult = _a.sent();
                        DatabaseFunctions.prepareRows(selectResult.rows);
                        return [2 /*return*/, selectResult.rows[0]];
                    case 3: throw 'update app token failed';
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        e_2 = _a.sent();
                        console.log(e_2);
                        throw 'could not generate and save app token';
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseFunctions.refreshAppToken = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var token, updateQuery, updateResult, selectResult, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.generateAppToken()];
                    case 1:
                        token = _a.sent();
                        updateQuery = {
                            tableName: 'apptoken',
                            columns: [
                                DatabaseFunctions.getColumnDefinition('key', 'text', token, false)
                            ]
                        };
                        return [4 /*yield*/, DatabaseFunctions.dbManager.update(updateQuery, "id=" + id + "::integer")];
                    case 2:
                        updateResult = _a.sent();
                        if (!(updateResult.rowCount === 1)) return [3 /*break*/, 4];
                        return [4 /*yield*/, DatabaseFunctions.dbManager.query({
                                text: DatabaseFunctions.selectAllStatements.appToken + ' where id=$1::integer',
                                values: [id]
                            })];
                    case 3:
                        selectResult = _a.sent();
                        DatabaseFunctions.prepareRows(selectResult.rows);
                        return [2 /*return*/, selectResult.rows[0]];
                    case 4: throw 'refresh app token failed';
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        e_3 = _a.sent();
                        console.log(e_3);
                        throw 'could not generate and save app token';
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseFunctions.createProject = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var insertQuery, insertionResult, id, selectResult, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        insertQuery = {
                            tableName: 'project',
                            columns: [
                                DatabaseFunctions.getColumnDefinition('name', 'text', data.name, false),
                                DatabaseFunctions.getColumnDefinition('shortname', 'text', data.shortname),
                                DatabaseFunctions.getColumnDefinition('description', 'text', data.description),
                                DatabaseFunctions.getColumnDefinition('configuration', 'text', data.configuration),
                                DatabaseFunctions.getColumnDefinition('startdate', 'timestamp', data.startdate),
                                DatabaseFunctions.getColumnDefinition('enddate', 'timestamp', data.enddate),
                                DatabaseFunctions.getColumnDefinition('active', 'boolean', data.active),
                                DatabaseFunctions.getColumnDefinition('admin_id', 'integer', data.admin_id)
                            ]
                        };
                        return [4 /*yield*/, DatabaseFunctions.dbManager.insert(insertQuery, 'id')];
                    case 1:
                        insertionResult = _a.sent();
                        if (!(insertionResult.rowCount === 1 && insertionResult.rows[0].hasOwnProperty('id'))) return [3 /*break*/, 3];
                        id = insertionResult.rows[0].id;
                        return [4 /*yield*/, DatabaseFunctions.dbManager.query({
                                text: DatabaseFunctions.selectAllStatements.project + ' where id=$1',
                                values: [id]
                            })];
                    case 2:
                        selectResult = _a.sent();
                        this.prepareRows(selectResult.rows);
                        return [2 /*return*/, selectResult.rows];
                    case 3: throw 'insertionResult does not have id';
                    case 4:
                        e_4 = _a.sent();
                        console.log(e_4);
                        throw 'Could not create and save a new project.';
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseFunctions.addMediaItem = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var insertQuery, insertionResult, id, selectResult, e_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        insertQuery = {
                            tableName: 'mediaitem',
                            columns: [
                                DatabaseFunctions.getColumnDefinition('url', 'text', data.url, false),
                                DatabaseFunctions.getColumnDefinition('type', 'text', data.type),
                                DatabaseFunctions.getColumnDefinition('size', 'integer', data.size),
                                DatabaseFunctions.getColumnDefinition('metadata', 'text', data.metadata)
                            ]
                        };
                        return [4 /*yield*/, DatabaseFunctions.dbManager.insert(insertQuery, 'id')];
                    case 1:
                        insertionResult = _a.sent();
                        if (!(insertionResult.rowCount === 1 && insertionResult.rows[0].hasOwnProperty('id'))) return [3 /*break*/, 3];
                        id = insertionResult.rows[0].id;
                        return [4 /*yield*/, DatabaseFunctions.dbManager.query({
                                text: DatabaseFunctions.selectAllStatements.mediaitem + ' where id=$1',
                                values: [id]
                            })];
                    case 2:
                        selectResult = _a.sent();
                        this.prepareRows(selectResult.rows);
                        return [2 /*return*/, selectResult.rows];
                    case 3: throw 'insertionResult does not have id';
                    case 4:
                        e_5 = _a.sent();
                        console.log(e_5);
                        throw 'Could not save a new media item.';
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseFunctions.addTool = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var insertQuery, insertionResult, id, selectResult, e_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        insertQuery = {
                            tableName: 'tool',
                            columns: [
                                DatabaseFunctions.getColumnDefinition('name', 'text', data.name, false),
                                DatabaseFunctions.getColumnDefinition('version', 'text', data.version),
                                DatabaseFunctions.getColumnDefinition('description', 'text', data.description),
                                DatabaseFunctions.getColumnDefinition('pid', 'text', data.description)
                            ]
                        };
                        return [4 /*yield*/, DatabaseFunctions.dbManager.insert(insertQuery, 'id')];
                    case 1:
                        insertionResult = _a.sent();
                        if (!(insertionResult.rowCount === 1 && insertionResult.rows[0].hasOwnProperty('id'))) return [3 /*break*/, 3];
                        id = insertionResult.rows[0].id;
                        return [4 /*yield*/, DatabaseFunctions.dbManager.query({
                                text: DatabaseFunctions.selectAllStatements.tool + ' where id=$1',
                                values: [id]
                            })];
                    case 2:
                        selectResult = _a.sent();
                        this.prepareRows(selectResult.rows);
                        return [2 /*return*/, selectResult.rows];
                    case 3: throw 'insertionResult does not have id';
                    case 4:
                        e_6 = _a.sent();
                        console.log(e_6);
                        throw 'Could not save a new tool.';
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseFunctions.addTranscript = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var insertQuery, insertionResult, id, selectResult, e_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        insertQuery = {
                            tableName: 'transcript',
                            columns: [
                                DatabaseFunctions.getColumnDefinition('pid', 'text', data.pid),
                                DatabaseFunctions.getColumnDefinition('orgtext', 'text', data.orgtext),
                                DatabaseFunctions.getColumnDefinition('transcript', 'text', data.transcript),
                                DatabaseFunctions.getColumnDefinition('assessment', 'text', data.assessment),
                                DatabaseFunctions.getColumnDefinition('priority', 'integer', data.priority),
                                DatabaseFunctions.getColumnDefinition('status', 'text', data.status),
                                DatabaseFunctions.getColumnDefinition('code', 'text', data.code),
                                DatabaseFunctions.getColumnDefinition('creationdate', 'timestamp', data.creationdate),
                                DatabaseFunctions.getColumnDefinition('startdate', 'timestamp', data.startdate),
                                DatabaseFunctions.getColumnDefinition('enddate', 'timestamp', data.enddate),
                                DatabaseFunctions.getColumnDefinition('log', 'text', data.log),
                                DatabaseFunctions.getColumnDefinition('comment', 'text', data.comment),
                                DatabaseFunctions.getColumnDefinition('tool_id', 'integer', data.tool_id),
                                DatabaseFunctions.getColumnDefinition('transcriber_id', 'integer', data.transcriber_id),
                                DatabaseFunctions.getColumnDefinition('project_id', 'integer', data.project_id),
                                DatabaseFunctions.getColumnDefinition('mediaitem_id', 'integer', data.mediaitem_id),
                                DatabaseFunctions.getColumnDefinition('nexttranscript_id', 'integer', data.nexttranscript_id)
                            ]
                        };
                        return [4 /*yield*/, DatabaseFunctions.dbManager.insert(insertQuery, 'id')];
                    case 1:
                        insertionResult = _a.sent();
                        if (!(insertionResult.rowCount === 1 && insertionResult.rows[0].hasOwnProperty('id'))) return [3 /*break*/, 3];
                        id = insertionResult.rows[0].id;
                        return [4 /*yield*/, DatabaseFunctions.dbManager.query({
                                text: DatabaseFunctions.selectAllStatements.transcript + ' where id=$1',
                                values: [id]
                            })];
                    case 2:
                        selectResult = _a.sent();
                        this.prepareRows(selectResult.rows);
                        return [2 /*return*/, selectResult.rows];
                    case 3: throw 'insertionResult does not have id';
                    case 4:
                        e_7 = _a.sent();
                        throw e_7;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseFunctions.getTranscriptByID = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var selectResult, transcriptRow, result, mediaItemResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, DatabaseFunctions.dbManager.query({
                            text: 'select * from transcript where id=$1::integer',
                            values: [id]
                        })];
                    case 1:
                        selectResult = _a.sent();
                        if (!(selectResult.rowCount === 1)) return [3 /*break*/, 4];
                        transcriptRow = selectResult.rows[0];
                        result = transcriptRow;
                        if (!(transcriptRow.hasOwnProperty('mediaitem_id') && transcriptRow.mediaitem_id)) return [3 /*break*/, 3];
                        return [4 /*yield*/, DatabaseFunctions.dbManager.query({
                                text: 'select * from mediaitem where id=$1::integer',
                                values: [transcriptRow.mediaitem_id]
                            })];
                    case 2:
                        mediaItemResult = _a.sent();
                        if (mediaItemResult.rowCount === 1) {
                            result.mediaitem = mediaItemResult.rows[0];
                            DatabaseFunctions.prepareRows([result.mediaitem]);
                        }
                        _a.label = 3;
                    case 3:
                        DatabaseFunctions.prepareRows([result]);
                        return [2 /*return*/, result];
                    case 4: throw 'Could not find a transcript with this ID.';
                }
            });
        });
    };
    DatabaseFunctions.getTranscriptsByProjectID = function (projectID) {
        return __awaiter(this, void 0, void 0, function () {
            var projectSelectResult, selectResult, results, _i, _a, row, mediaItem, mediaItemRows, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, DatabaseFunctions.dbManager.query({
                            text: 'select id from project where id=$1::integer',
                            values: [projectID]
                        })];
                    case 1:
                        projectSelectResult = _b.sent();
                        if (!(projectSelectResult.rowCount === 1)) return [3 /*break*/, 7];
                        return [4 /*yield*/, DatabaseFunctions.dbManager.query({
                                text: 'select * from transcript where project_id=$1::integer order by id',
                                values: [projectID]
                            })];
                    case 2:
                        selectResult = _b.sent();
                        results = [];
                        if (!(selectResult.rowCount > 0)) return [3 /*break*/, 6];
                        _i = 0, _a = selectResult.rows;
                        _b.label = 3;
                    case 3:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        row = _a[_i];
                        return [4 /*yield*/, DatabaseFunctions.dbManager.query({
                                text: 'select * from mediaitem where id=$1::integer',
                                values: [row.mediaitem_id]
                            })];
                    case 4:
                        mediaItem = _b.sent();
                        mediaItemRows = mediaItem.rows;
                        result = __assign({}, row);
                        if (mediaItem.rowCount === 1) {
                            result.mediaitem = __assign({}, mediaItemRows[0]);
                            DatabaseFunctions.prepareRows([result.mediaitem]);
                        }
                        results.push(result);
                        _b.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6:
                        DatabaseFunctions.prepareRows(results);
                        return [2 /*return*/, results];
                    case 7: throw "Can not find a project with ID " + projectID + ".";
                }
            });
        });
    };
    DatabaseFunctions.removeAppToken = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var removeResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, DatabaseFunctions.dbManager.query({
                            text: 'delete from apptoken where id=$1::numeric',
                            values: [id]
                        })];
                    case 1:
                        removeResult = _a.sent();
                        if (removeResult.rowCount < 1) {
                            throw 'could not remove app token';
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    DatabaseFunctions.listAppTokens = function () {
        return __awaiter(this, void 0, void 0, function () {
            var selectResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, DatabaseFunctions.dbManager.query({
                            text: DatabaseFunctions.selectAllStatements.appToken + ' order by id'
                        })];
                    case 1:
                        selectResult = _a.sent();
                        DatabaseFunctions.prepareRows(selectResult.rows);
                        return [2 /*return*/, selectResult.rows];
                }
            });
        });
    };
    DatabaseFunctions.createUser = function (userData) {
        return __awaiter(this, void 0, void 0, function () {
            var insertAccountQuery, insertionResult, id, selectResult, roles;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        insertAccountQuery = {
                            tableName: 'account',
                            columns: [
                                DatabaseFunctions.getColumnDefinition('username', 'text', userData.name),
                                DatabaseFunctions.getColumnDefinition('email', 'text', userData.email),
                                DatabaseFunctions.getColumnDefinition('hash', 'text', userData.password),
                                DatabaseFunctions.getColumnDefinition('loginmethod', 'text', userData.loginmethod)
                            ]
                        };
                        return [4 /*yield*/, DatabaseFunctions.dbManager.insert(insertAccountQuery, 'id')];
                    case 1:
                        insertionResult = _a.sent();
                        if (!(insertionResult.rowCount === 1 && insertionResult.rows[0].hasOwnProperty('id'))) return [3 /*break*/, 4];
                        id = insertionResult.rows[0].id;
                        return [4 /*yield*/, DatabaseFunctions.assignUserRolesToUser({
                                roles: [database_types_1.UserRole.transcriber],
                                accountID: id
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, DatabaseFunctions.dbManager.query({
                                text: 'select ac.id::integer, ac.username::text, ac.email::text, ac.loginmethod::text, ac.active::boolean, ac.hash::text, ac.training::text, ac.comment::text, ac.createdate::timestamp, r.label::text as role from account ac full outer join account_role ar ON ac.id=ar.account_id full outer join role r ON r.id=ar.role_id where ac.id=$1::integer',
                                values: [
                                    id
                                ]
                            })];
                    case 3:
                        selectResult = _a.sent();
                        if (selectResult.rowCount > 0) {
                            DatabaseFunctions.prepareRows(selectResult.rows);
                            roles = selectResult.rows.map(function (a) { return a.role; }).filter(function (a) { return !(a === undefined || a === null); });
                            return [2 /*return*/, {
                                    id: selectResult.rows[0].id,
                                    roles: roles
                                }];
                        }
                        _a.label = 4;
                    case 4: throw 'Could not create user.';
                }
            });
        });
    };
    DatabaseFunctions.assignUserRolesToUser = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var rolesTable, queries, _loop_1, _i, _a, role, transactionResult;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getRoles()];
                    case 1:
                        rolesTable = _b.sent();
                        queries = [];
                        // remove all roles from this account at first
                        queries.push({
                            text: 'delete from account_role where account_id=$1::integer',
                            values: [data.accountID]
                        });
                        _loop_1 = function (role) {
                            var roleEntry = rolesTable.find(function (a) { return a.label === role; });
                            if (roleEntry) {
                                var roleID = roleEntry.id;
                                queries.push({
                                    text: 'insert into account_role(account_id, role_id) values($1::integer, $2::integer)',
                                    values: [data.accountID, roleID]
                                });
                            }
                            else {
                                throw "Could not find role '" + role + "'";
                            }
                        };
                        for (_i = 0, _a = data.roles; _i < _a.length; _i++) {
                            role = _a[_i];
                            _loop_1(role);
                        }
                        return [4 /*yield*/, DatabaseFunctions.dbManager.transaction(queries)];
                    case 2:
                        transactionResult = _b.sent();
                        if (transactionResult.command === 'COMMIT') {
                            return [2 /*return*/];
                        }
                        throw 'Could not assign role';
                }
            });
        });
    };
    DatabaseFunctions.getRoles = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, DatabaseFunctions.dbManager.query({
                            text: 'select * FROM role'
                        })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows];
                }
            });
        });
    };
    DatabaseFunctions.getRolesByUserID = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var rolesTable, accountRolesTable;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, DatabaseFunctions.getRoles()];
                    case 1:
                        rolesTable = _a.sent();
                        return [4 /*yield*/, DatabaseFunctions.dbManager.query({
                                text: 'select * from account_role where account_id=$1::integer',
                                values: [id]
                            })];
                    case 2:
                        accountRolesTable = _a.sent();
                        return [2 /*return*/, accountRolesTable.rows.map(function (a) { return a.role_id; })
                                .map(function (a) {
                                var role = rolesTable.find(function (b) { return b.id === a; });
                                if (role) {
                                    return role.label;
                                }
                                return null;
                            })
                                .filter(function (a) { return a !== null; })];
                }
            });
        });
    };
    DatabaseFunctions.listUsers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var selectResult, results, _i, _a, row, roles, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, DatabaseFunctions.dbManager.query({
                            text: this.selectAllStatements.account + ' order by id'
                        })];
                    case 1:
                        selectResult = _b.sent();
                        results = [];
                        _i = 0, _a = selectResult.rows;
                        _b.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        row = _a[_i];
                        return [4 /*yield*/, DatabaseFunctions.getRolesByUserID(row.id)];
                    case 3:
                        roles = _b.sent();
                        delete row.hash;
                        result = __assign(__assign({}, row), { roles: roles });
                        results.push(result);
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        DatabaseFunctions.prepareRows(results);
                        return [2 /*return*/, results];
                }
            });
        });
    };
    DatabaseFunctions.removeUserByID = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var removeResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, DatabaseFunctions.dbManager.transaction([
                            {
                                text: 'update transcript set transcriber_id=null where transcriber_id=$1::integer',
                                values: [id]
                            },
                            {
                                text: 'update project set admin_id=null where admin_id=$1::integer',
                                values: [id]
                            },
                            {
                                text: 'delete from account_role where account_id=$1::integer',
                                values: [id]
                            },
                            {
                                text: 'delete from account where id=$1::integer',
                                values: [id]
                            }
                        ])];
                    case 1:
                        removeResult = _a.sent();
                        if (removeResult.command !== 'COMMIT') {
                            throw "Could not remove user account.}.";
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    DatabaseFunctions.getUserByHash = function (loginmethod, hash) {
        return __awaiter(this, void 0, void 0, function () {
            var selectResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, DatabaseFunctions.dbManager.query({
                            text: this.selectAllStatements.account + ' where hash=$1::text and loginmethod=$2::text',
                            values: [hash, loginmethod]
                        })];
                    case 1:
                        selectResult = _a.sent();
                        if (selectResult.rowCount === 1) {
                            DatabaseFunctions.prepareRows(selectResult.rows);
                            return [2 /*return*/, true];
                        }
                        return [2 /*return*/, false];
                }
            });
        });
    };
    DatabaseFunctions.getUserInfo = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var selectResult, roles, row;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        selectResult = null;
                        if (!(data.name && data.name.trim() !== '')) return [3 /*break*/, 2];
                        return [4 /*yield*/, DatabaseFunctions.dbManager.query({
                                text: 'select ac.id::integer, ac.username::text, ac.email::text, ac.loginmethod::text, ac.active::boolean, ac.hash::text, ac.training::text, ac.comment::text, ac.createdate::timestamp, r.label::text as role from account ac full outer join account_role ar ON ac.id=ar.account_id full outer join role r ON r.id=ar.role_id where ac.username=$1::text',
                                values: [data.name]
                            })];
                    case 1:
                        selectResult = _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        if (!(data.hash && data.hash.trim() !== '')) return [3 /*break*/, 4];
                        return [4 /*yield*/, DatabaseFunctions.dbManager.query({
                                text: 'select ac.id::integer, ac.username::text, ac.email::text, ac.loginmethod::text, ac.active::boolean, ac.hash::text, ac.training::text, ac.comment::text, ac.createdate::timestamp, r.label::text as role from account ac full outer join account_role ar ON ac.id=ar.account_id full outer join role r ON r.id=ar.role_id where ac.hash=$1::text',
                                values: [data.hash]
                            })];
                    case 3:
                        selectResult = _a.sent();
                        _a.label = 4;
                    case 4:
                        if (selectResult) {
                            roles = selectResult.rows.map(function (a) { return a.role; }).filter(function (a) { return !(a === undefined || a === null); });
                            row = selectResult.rows[0];
                            if (selectResult.rowCount > 0) {
                                return [2 /*return*/, __assign(__assign({}, row), { role: roles })];
                            }
                        }
                        return [2 /*return*/, null];
                }
            });
        });
    };
    DatabaseFunctions.changeUserPassword = function (id, hash) {
        return __awaiter(this, void 0, void 0, function () {
            var updateResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, DatabaseFunctions.dbManager.query({
                            text: 'update account set hash=$1::text where id=$2::integer returning id',
                            values: [hash, id]
                        })];
                    case 1:
                        updateResult = _a.sent();
                        if (updateResult.rowCount === 1) {
                            return [2 /*return*/];
                        }
                        throw 'Can not change password.';
                }
            });
        });
    };
    DatabaseFunctions.getUserInfoByUserID = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var selectResult, role, row;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, DatabaseFunctions.dbManager.query({
                            text: 'select ac.id::integer, ac.username::text, ac.email::text, ac.loginmethod::text, ac.active::boolean, ac.hash::text, ac.training::text, ac.comment::text, ac.createdate::timestamp, r.label::text as role from account ac full outer join account_role ar ON ac.id=ar.account_id full outer join role r ON r.id=ar.role_id where ac.id=$1::integer',
                            values: [id]
                        })];
                    case 1:
                        selectResult = _a.sent();
                        role = selectResult.rows.map(function (a) { return a.role; }).filter(function (a) { return !(a === undefined || a === null); });
                        if (selectResult.rowCount > 0) {
                            row = selectResult.rows[0];
                            DatabaseFunctions.prepareRows([row]);
                            return [2 /*return*/, __assign(__assign({}, row), { role: role })];
                        }
                        throw 'could not find user';
                }
            });
        });
    };
    DatabaseFunctions.deliverNewMedia = function (dataDeliveryRequest) {
        return __awaiter(this, void 0, void 0, function () {
            var media, mediaInsertResult, mediaID, transcriptResult, result, mediaItem;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        media = dataDeliveryRequest.media;
                        return [4 /*yield*/, DatabaseFunctions.addMediaItem({
                                url: media.url,
                                type: media.type,
                                size: media.size,
                                metadata: media.metadata
                            })];
                    case 1:
                        mediaInsertResult = _a.sent();
                        if (!(mediaInsertResult.length > 0)) return [3 /*break*/, 5];
                        mediaID = mediaInsertResult[0].id;
                        return [4 /*yield*/, DatabaseFunctions.addTranscript({
                                orgtext: dataDeliveryRequest.orgtext,
                                transcript: dataDeliveryRequest.transcript,
                                project_id: dataDeliveryRequest.project_id,
                                mediaitem_id: mediaID,
                                status: 'FREE'
                            })];
                    case 2:
                        transcriptResult = _a.sent();
                        if (!(transcriptResult.length > 0)) return [3 /*break*/, 4];
                        result = transcriptResult[0];
                        return [4 /*yield*/, DatabaseFunctions.dbManager.query({
                                text: this.selectAllStatements.mediaitem + ' where id=$1::integer',
                                values: [mediaID]
                            })];
                    case 3:
                        mediaItem = _a.sent();
                        if (mediaItem.rowCount === 1) {
                            result.mediaitem = mediaItem.rows[0];
                            DatabaseFunctions.prepareRows([result.mediaitem]);
                        }
                        DatabaseFunctions.prepareRows([result]);
                        return [2 /*return*/, result];
                    case 4: throw 'Could not save transcript entry.';
                    case 5: throw 'Could not save media entry.';
                }
            });
        });
    };
    DatabaseFunctions.generateAppToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        crypto_1.randomBytes(20, function (err, buffer) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(buffer.toString('hex'));
                            }
                        });
                    })];
            });
        });
    };
    DatabaseFunctions.prepareRows = function (rows) {
        for (var _i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
            var row = rows_1[_i];
            for (var col in row) {
                if (row.hasOwnProperty(col)) {
                    if (row[col] === null || row[col] === undefined) {
                        delete row[col];
                    }
                    else if (row.hasOwnProperty(col) && col.indexOf('date') > -1
                        && !(row[col] === undefined || row[col] === null) &&
                        row[col].toISOString !== undefined && row[col].toISOString !== null) {
                        row[col] = row[col].toISOString();
                    }
                }
            }
        }
    };
    DatabaseFunctions.getColumnDefinition = function (key, type, value, maybeNull) {
        if (maybeNull === void 0) { maybeNull = true; }
        return {
            key: key, type: type, value: value, maybeNull: maybeNull
        };
    };
    DatabaseFunctions.getPasswordHash = function (password) {
        var salt = crypto_js_1.SHA256(DatabaseFunctions.settings.api.passwordSalt).toString();
        return crypto_js_1.SHA256(password + salt).toString();
    };
    DatabaseFunctions.selectAllStatements = {
        appToken: 'select id::integer, name::text, key::text, domain::text, description::text, registrations::boolean from apptoken',
        account: 'select ac.id::integer, ac.username::text, ac.email::text, ac.loginmethod::text, ac.active::boolean, ac.hash::text, ac.training::text, ac.comment::text, ac.createdate::timestamp from account ac',
        project: 'select id::integer, name::text, shortname::text, description::text, configuration::text, startdate::timestamp, enddate::timestamp, active::boolean, admin_id::integer from project',
        mediaitem: 'select id::integer, url::text, type::text, size::integer, metadata::text from mediaitem',
        tool: 'select id::integer, name::text, version::text, description::text, pid::text from tool',
        transcript: 'select id::integer, pid::text, orgtext::text, transcript::text, assessment::text, priority::integer, status::text, code::text, creationdate::timestamp, startdate::timestamp, enddate::timestamp, log::text, comment::text, tool_id::integer, transcriber_id::integer, project_id::integer, mediaitem_id::integer, nexttranscript_id::integer from transcript'
    };
    return DatabaseFunctions;
}());
exports.DatabaseFunctions = DatabaseFunctions;
