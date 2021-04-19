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
exports.ShibbolethAuthenticator = void 0;
var authenticator_1 = require("../authenticator");
var follow_redirects_1 = require("follow-redirects");
var ShibbolethAuthenticator = /** @class */ (function (_super) {
    __extends(ShibbolethAuthenticator, _super);
    function ShibbolethAuthenticator(apiURL, cookies) {
        var _this = _super.call(this, 'Shibboleth', apiURL, cookies) || this;
        _this.cookie = {
            key: '',
            value: ''
        };
        _this._authURL = apiURL + "/authShibboleth";
        if (cookies) {
            for (var attr in cookies) {
                if (cookies.hasOwnProperty(attr)) {
                    if (attr.indexOf('_shibsession_') > -1) {
                        _this.cookie.key = attr;
                        _this.cookie.value = cookies[attr];
                        _this._uid = attr.replace('_shibsession_', '');
                        _this._isActive = true;
                        break;
                    }
                }
            }
        }
        return _this;
    }
    ShibbolethAuthenticator.prototype.isAuthenticated = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var ended = false;
                        setTimeout(function () {
                            if (!ended) {
                                ended = true;
                                reject('timeout');
                            }
                        }, 3000);
                        var httpClient = (_this._authURL.indexOf('https') > -1) ? follow_redirects_1.https : follow_redirects_1.http;
                        var request = httpClient.get(_this._authURL, {
                            headers: {
                                Cookie: _this.cookie.key + "=" + _this.cookie.value
                            }
                        }, function (response) {
                            if (!ended) {
                                ended = true;
                                console.log("shibboleth is authenticated: " + (response.statusCode === 200));
                                resolve(response.statusCode === 200);
                            }
                        });
                        request.on('error', function (error) {
                            reject(error);
                        });
                    })];
            });
        });
    };
    return ShibbolethAuthenticator;
}(authenticator_1.Authenticator));
exports.ShibbolethAuthenticator = ShibbolethAuthenticator;
