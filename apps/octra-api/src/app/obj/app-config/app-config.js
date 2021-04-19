"use strict";
exports.__esModule = true;
exports.AppConfiguration = void 0;
var jsonschema_1 = require("jsonschema");
var app_config_schema_1 = require("./app-config.schema");
var AppConfiguration = /** @class */ (function () {
    function AppConfiguration(configuration) {
        var validator = new jsonschema_1.Validator();
        this.configuration = configuration;
        this._validation = validator.validate(configuration, app_config_schema_1.AppConfigurationSchema);
    }
    Object.defineProperty(AppConfiguration.prototype, "version", {
        get: function () {
            return this._version;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AppConfiguration.prototype, "validation", {
        get: function () {
            return this._validation;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AppConfiguration.prototype, "api", {
        get: function () {
            return this.configuration.api;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AppConfiguration.prototype, "database", {
        get: function () {
            return this.configuration.database;
        },
        enumerable: false,
        configurable: true
    });
    return AppConfiguration;
}());
exports.AppConfiguration = AppConfiguration;
