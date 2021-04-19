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
exports.OctraApi = void 0;
var bodyParser = require("body-parser");
var path = require("path");
var Path = require("path");
var api_command_1 = require("./api/v1/commands/api.command");
var terminus_1 = require("@godaddy/terminus");
var fsExtra = require("fs-extra");
var ejs = require("ejs");
var fs = require("fs");
var cors = require("cors");
var octra_api_module_1 = require("./octra-api.module");
var app_config_1 = require("./obj/app-config/app-config");
var postgreSQL_manager_1 = require("./db/postgreSQL.manager");
var express = require("express");
var cookieParser = require("cookie-parser");
var crypto_js_1 = require("crypto-js");
var shibboleth_authenticator_1 = require("./authenticators/shibboleth/shibboleth.authenticator");
var OctraApi = /** @class */ (function () {
    function OctraApi() {
        this._activeAPIs = [];
        this.name = 'OCTRA';
        this.version = '0.2.7';
        this._activeAPIs = octra_api_module_1.APIModule.activeAPIs;
    }
    Object.defineProperty(OctraApi.prototype, "appPath", {
        get: function () {
            return this._appPath;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(OctraApi.prototype, "executionPath", {
        get: function () {
            return this._executionPath;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(OctraApi.prototype, "activeAPIs", {
        get: function () {
            return this._activeAPIs;
        },
        enumerable: false,
        configurable: true
    });
    OctraApi.prototype.init = function (environment) {
        var _this = this;
        this.environment = environment;
        if (environment === 'development') {
            this._executionPath = __dirname;
        }
        else {
            this._executionPath = path.dirname(process.execPath);
        }
        this._appPath = __dirname;
        // loadSettings
        var settingsJSON = fs.readFileSync(path.join(this._executionPath, 'config.json'), {
            encoding: 'utf-8'
        });
        var appConfiguration = new app_config_1.AppConfiguration(JSON.parse(settingsJSON));
        this.settings = appConfiguration;
        this.settings.appPath = this._appPath;
        this.settings.executionPath = this._executionPath;
        this.settings.api.authenticator = {
            appToken: crypto_js_1.SHA256(Date.now() + '2634872h3gr692seß0d').toString()
        };
        if (this.settings.validation.valid) {
            var app = express();
            app.set('view engine', 'ejs');
            app.engine('ejs', ejs.__express); //<-- this
            app.set('views', path.join(this._appPath, 'views'));
            // use bodyParser in order to parse JSON data
            app.use(bodyParser.urlencoded({ extended: true }));
            app.use(bodyParser.json());
            app.use(cors());
            app.use(cookieParser());
            var router = express.Router();
            this.dbManager = this.getDBWrapper(this.settings.database);
            router.route('*').all(function (req, res, next) {
                res.removeHeader('x-powered-by');
                req['appSettings'] = __assign({}, _this.settings);
                delete req['appSettings'].configuration.database;
                next();
            });
            for (var _i = 0, _a = this._activeAPIs; _i < _a.length; _i++) {
                var api = _a[_i];
                api.init(app, environment, this.settings, this.dbManager);
            }
            app.get('/robots.txt', function (req, res) {
                res.type('text/plain');
                res.send('User-agent: *\nDisallow: /');
            });
            console.log("app path is " + Path.join(this._appPath, '/views/index.ejs'));
            app.get('/', function (req, res) {
                res.render('index.ejs', {
                    activeAPIs: _this._activeAPIs,
                    settings: _this.settings,
                    url: _this.settings.api.url
                });
            });
            //set port
            var port = 0;
            if (process.env.PORT) {
                port = Number(process.env.PORT);
            }
            else {
                port = this.settings.api.port;
            }
            if (this.settings.api.debugging) {
                router.use(function (req, res, next) {
                    // do logging
                    console.log("Got new request");
                    console.log(JSON.stringify(req.headers));
                    next(); // make sure we go to the next routes and don't stop here
                });
            }
            console.log("static is " + path.join(this._appPath, 'static'));
            app.use(express.static(path.join(this._appPath, 'static')));
            app.use('/', router);
            // TODO add this to the ShibbolethAuthenticator class
            router.route("/authShibboleth").get(function (req, res) {
                var authenticator = new shibboleth_authenticator_1.ShibbolethAuthenticator(_this.settings.api.url, req.cookies);
                res.render("authenticators/shibboleth/index.ejs", {
                    appToken: _this.settings.api.authenticator.appToken,
                    shibbolethUID: authenticator.uid
                });
            });
            router.route('*').all(function (req, res) {
                api_command_1.ApiCommand.sendError(res, 400, "This route does not exist. Please check your URL again. " + req.url);
            });
            // Start listening!
            var server = app.listen(port, this.settings.api.host, function () {
                console.log("\nStarted " + _this.name + " REST API (v" + _this.version + ") on http://localhost:" + _this.settings.api.port + "!\n");
                console.log("Active APIs:");
                for (var _i = 0, _a = _this._activeAPIs; _i < _a.length; _i++) {
                    var api = _a[_i];
                    console.log("|- " + api.information.apiSlug);
                    console.log("\t|- Reference: http://localhost:" + _this.settings.api.port + "/" + api.information.apiSlug + "/reference");
                    console.log("\t|- API methods (order is equal to routing order)");
                    for (var _b = 0, _c = api.modules; _b < _c.length; _b++) {
                        var module_1 = _c[_b];
                        console.log("\t\t[Module] " + module_1.url);
                        for (var _d = 0, _e = module_1.commands; _d < _e.length; _d++) {
                            var command = _e[_d];
                            console.log("\t\t\t- " + command.root + command.url + " => " + command.name);
                        }
                    }
                }
            });
            terminus_1.createTerminus(server, {
                signal: 'SIGINT',
                onSignal: function () {
                    return new Promise(function (resolve) {
                        if (_this.environment === 'development') {
                            console.log("\nDev mode: Clear auto generated folders...");
                            fsExtra.removeSync('./build');
                        }
                        _this.dbManager.close().then(function () {
                            resolve(null);
                        })["catch"](function (error) {
                            console.log(error);
                            resolve(null);
                        });
                    });
                }
            });
            return app;
        }
        else {
            // invalid config
            console.log("The config file is invalid:");
            console.log(this.settings.validation.errors.map(function (a) { return "-> Error: " + a.stack; }).join('\n'));
            return null;
        }
    };
    OctraApi.prototype.getDBWrapper = function (dbConfiguration) {
        switch (dbConfiguration.dbType) {
            case 'PostgreSQL':
                return new postgreSQL_manager_1.PostgreSQLManager(dbConfiguration);
        }
        return null;
    };
    return OctraApi;
}());
exports.OctraApi = OctraApi;
