"use strict";
exports.__esModule = true;
exports.CommandModule = void 0;
var api_command_1 = require("./api.command");
var express_1 = require("express");
var middlewares_1 = require("../obj/middlewares");
var CommandModule = /** @class */ (function () {
    function CommandModule(url) {
        this._commands = [];
        this._url = url;
    }
    Object.defineProperty(CommandModule.prototype, "url", {
        get: function () {
            return this._url;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CommandModule.prototype, "commands", {
        get: function () {
            return this._commands;
        },
        enumerable: false,
        configurable: true
    });
    CommandModule.prototype.init = function (v1Router, environment, settings) {
        var router = express_1.Router();
        router.use(function (req, res, next) {
            middlewares_1.verifyAppToken(req, res, next, settings, function () {
                next();
            });
        });
        // sorting commands is important for routing! Important!
        this._commands.sort(function (a, b) {
            if (a.root === b.root) {
                if (a.url === b.url) {
                    return 0;
                }
                else if (a.url.length > b.url.length) {
                    return -1;
                }
                return 1;
            }
            else {
                return a.root.length - b.root.length;
            }
        });
        var _loop_1 = function (command) {
            command.init(settings);
            if (command.needsJWTAuthentication) {
                router.use(command.url, function (req, res, next) {
                    middlewares_1.verifyWebToken(req, res, next, settings, function (tokenBody) {
                        req.decoded = tokenBody;
                        middlewares_1.verifyUserRole(req, res, command, function () {
                            // user may use this api method
                            next();
                        });
                    });
                });
            }
            var route = router.route(command.url);
            var callback = function (req, res) {
                console.log("called command " + command.name + " (" + command.type + "): " + command.url);
                command["do"](req, res);
            };
            switch (command.type) {
                case api_command_1.RequestType.GET:
                    route.get(callback);
                    break;
                case api_command_1.RequestType.POST:
                    route.post(callback);
                    break;
                case api_command_1.RequestType.PUT:
                    route.put(callback);
                    break;
                case api_command_1.RequestType.DELETE:
                    route["delete"](callback);
                    break;
            }
        };
        for (var _i = 0, _a = this._commands; _i < _a.length; _i++) {
            var command = _a[_i];
            _loop_1(command);
        }
        v1Router.use(this._url, router);
    };
    return CommandModule;
}());
exports.CommandModule = CommandModule;
