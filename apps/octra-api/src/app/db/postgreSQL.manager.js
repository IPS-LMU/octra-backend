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
exports.PostgreSQLManager = void 0;
var DBManager_1 = require("./DBManager");
var pg_1 = require("pg");
var fs = require("fs");
/**
 * See https://node-postgres.com/
 */
var PostgreSQLManager = /** @class */ (function (_super) {
    __extends(PostgreSQLManager, _super);
    function PostgreSQLManager(dbSettings) {
        var _this = _super.call(this, dbSettings) || this;
        var ssl = _this.loadSSLFileContents(dbSettings.ssl);
        _this.pool = new pg_1.Pool({
            user: _this.dbSettings.dbUser,
            host: _this.dbSettings.dbHost,
            database: _this.dbSettings.dbName,
            password: _this.dbSettings.dbPassword,
            port: _this.dbSettings.dbPort,
            ssl: ssl
        });
        return _this;
    }
    PostgreSQLManager.prototype.loadSSLFileContents = function (sslConfig) {
        var result;
        if (sslConfig) {
            result = {};
            for (var attr in sslConfig) {
                if (sslConfig.hasOwnProperty(attr) && sslConfig[attr] && sslConfig[attr] !== '') {
                    if (fs.existsSync(sslConfig[attr])) {
                        result[attr] = fs.readFileSync(sslConfig[attr], { encoding: 'utf-8' });
                    }
                }
            }
        }
        return result;
    };
    PostgreSQLManager.prototype.connect = function () {
        return this.pool.connect();
    };
    PostgreSQLManager.prototype.query = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.pool.query(query).then(function (result) {
                            resolve(result);
                        })["catch"](function (error) {
                            reject(error);
                        });
                    })];
            });
        });
    };
    PostgreSQLManager.prototype.transaction = function (queries) {
        return __awaiter(this, void 0, void 0, function () {
            var client, _i, queries_1, sqlQuery, result, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.pool.connect()];
                    case 1:
                        client = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 9, 11, 12]);
                        return [4 /*yield*/, client.query('BEGIN')];
                    case 3:
                        _a.sent();
                        _i = 0, queries_1 = queries;
                        _a.label = 4;
                    case 4:
                        if (!(_i < queries_1.length)) return [3 /*break*/, 7];
                        sqlQuery = queries_1[_i];
                        return [4 /*yield*/, client.query(sqlQuery)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [4 /*yield*/, client.query('COMMIT')];
                    case 8:
                        result = _a.sent();
                        client.release();
                        return [2 /*return*/, result];
                    case 9:
                        e_1 = _a.sent();
                        // Make sure to release the client before any error handling,
                        // just in case the error handling itself throws an error.
                        client.release();
                        return [4 /*yield*/, client.query('ROLLBACK')];
                    case 10:
                        _a.sent();
                        throw e_1;
                    case 11: return [7 /*endfinally*/];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    PostgreSQLManager.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.pool.end()];
            });
        });
    };
    PostgreSQLManager.prototype.insert = function (query, idColumn) {
        if (idColumn === void 0) { idColumn = 'id'; }
        return __awaiter(this, void 0, void 0, function () {
            var sqlQuery;
            return __generator(this, function (_a) {
                sqlQuery = this.createSQLQueryForInsert(query, idColumn);
                if (sqlQuery) {
                    return [2 /*return*/, this.query(sqlQuery)];
                }
                throw 'InsertQuery error: columns length is 0.';
            });
        });
    };
    PostgreSQLManager.prototype.update = function (query, where) {
        return __awaiter(this, void 0, void 0, function () {
            var sqlQuery;
            return __generator(this, function (_a) {
                sqlQuery = this.createSQLQueryForUpdate(query, where);
                if (sqlQuery) {
                    return [2 /*return*/, this.query(sqlQuery)];
                }
                throw 'UpdateQuery error: columns length is 0.';
            });
        });
    };
    PostgreSQLManager.prototype.createSQLQueryForInsert = function (query, idColumn) {
        if (idColumn === void 0) { idColumn = 'id'; }
        var columns = query.columns.filter(function (a) { return !(a.value === undefined || a.value === null); });
        if (columns.length > 0) {
            var statement = "" + query.tableName;
            var values = columns.map(function (a) { return a.value; });
            statement += '(' + columns.map(function (a) { return a.key; }).join(', ') + ')';
            statement += ' values(' + columns.map(function (a, index) { return "$" + (index + 1) + "::" + a.type; }).join(', ') + ')';
            statement = "insert into " + statement + "\n                         returning " + idColumn;
            return {
                text: statement,
                values: values
            };
        }
        return null;
    };
    PostgreSQLManager.prototype.createSQLQueryForUpdate = function (query, where) {
        var columns = query.columns.filter(function (a) { return !(a.value === undefined || a.value === null); });
        if (columns.length > 0) {
            var statement = '';
            var values = columns.map(function (a) { return a.value; });
            statement += columns.map(function (a, i) { return a.key + "=$" + (i + 1) + "::" + a.type; }).join(', ');
            statement = "update " + query.tableName + "\n                         set " + statement + "\n                         where " + where;
            return {
                text: statement,
                values: values
            };
        }
        return null;
    };
    return PostgreSQLManager;
}(DBManager_1.DBManager));
exports.PostgreSQLManager = PostgreSQLManager;
