"use strict";
exports.__esModule = true;
exports.Authenticator = void 0;
var Authenticator = /** @class */ (function () {
    function Authenticator(name, apiURL, cookies) {
        this._uid = '';
        this._name = name;
        this._apiURL = apiURL;
        this._cookies = cookies;
    }
    Object.defineProperty(Authenticator.prototype, "authURL", {
        get: function () {
            return this._authURL;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Authenticator.prototype, "uid", {
        get: function () {
            return this._uid;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Authenticator.prototype, "isActive", {
        get: function () {
            return this._isActive;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Authenticator.prototype, "cookies", {
        get: function () {
            return this._cookies;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Authenticator.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: false,
        configurable: true
    });
    return Authenticator;
}());
exports.Authenticator = Authenticator;
