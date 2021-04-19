"use strict";
exports.__esModule = true;
exports.DBManager = void 0;
var DBManager = /** @class */ (function () {
    function DBManager(dbSettings) {
        this.dbSettings = dbSettings;
    }
    Object.defineProperty(DBManager.prototype, "connected", {
        get: function () {
            return this._connected;
        },
        enumerable: false,
        configurable: true
    });
    return DBManager;
}());
exports.DBManager = DBManager;
