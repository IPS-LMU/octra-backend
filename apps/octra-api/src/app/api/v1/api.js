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
exports.__esModule = true;
exports.APIV1 = void 0;
/***
 * This class contains a list of API commands and a call() method to use a command from list
 */
var express_1 = require("express");
var bodyParser = require("body-parser");
var sample_command_1 = require("./commands/sample.command");
var api_module_1 = require("./api.module");
var database_functions_1 = require("./obj/database.functions");
var APIV1 = /** @class */ (function () {
    function APIV1() {
        this._modules = [];
    }
    Object.defineProperty(APIV1.prototype, "modules", {
        get: function () {
            return this._modules;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(APIV1.prototype, "appPath", {
        get: function () {
            return this._appPath;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(APIV1.prototype, "information", {
        get: function () {
            return {
                name: 'OCTRA',
                version: '0.2.7',
                apiSlug: 'v1'
            };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(APIV1.prototype, "instance", {
        get: function () {
            if (APIV1.instance === undefined) {
                return new APIV1();
            }
            return APIV1.instance;
        },
        enumerable: false,
        configurable: true
    });
    /***
     * initializes API
     * @param app Express server
     * @param environment 'production' or 'development'
     * @param settings
     * @param dbManager
     */
    APIV1.prototype.init = function (app, environment, settings, dbManager) {
        var _this = this;
        database_functions_1.DatabaseFunctions.init(dbManager, settings);
        this._appPath = process.cwd();
        var v1Router = express_1.Router();
        v1Router.use(bodyParser.urlencoded({ extended: false }));
        v1Router.use(bodyParser.json());
        this._modules = api_module_1.APIV1Module.modules;
        // register all commands
        for (var i = 0; i < this._modules.length; i++) {
            var module_1 = this._modules[i];
            module_1.init(v1Router, environment, settings);
        }
        var commandsArray = api_module_1.APIV1Module.modules.map(function (a) { return a.commands; }).reduce(function (acc, x) {
            return acc.concat(x, []);
        }).map(function (a) {
            return __assign(__assign({}, a), { _requestStructure: JSON.stringify(a.requestStructure, null, 2), _responseStructure: JSON.stringify(a.responseStructure, null, 2), _url: "/" + _this.information.apiSlug + a.root + a.url });
        });
        commandsArray.sort(function (a, b) {
            if (a._name > b._name) {
                return 1;
            }
            else if (a._name < b._name) {
                return -1;
            }
            return 0;
        });
        v1Router.route("/reference").get(function (req, res) {
            // const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
            res.render("api/" + _this.information.apiSlug + "/index.ejs", {
                commands: commandsArray,
                apiDefaultResponseSchema: JSON.stringify(new sample_command_1.SampleCommand().defaultResponseSchema, null, 2),
                apiInformation: _this.information,
                appSettings: settings,
                url: settings.api.url
            });
        });
        app.use("/" + this.information.apiSlug, v1Router);
    };
    return APIV1;
}());
exports.APIV1 = APIV1;
