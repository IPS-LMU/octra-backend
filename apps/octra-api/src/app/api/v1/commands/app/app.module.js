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
exports.__esModule = true;
exports.AppModule = void 0;
var apptoken_create_command_1 = require("./apptoken.create.command");
var apptoken_remove_command_1 = require("./apptoken.remove.command");
var apptoken_list_command_1 = require("./apptoken.list.command");
var command_module_1 = require("../command.module");
var apptoken_change_command_1 = require("./apptoken.change.command");
var apptoken_refresh_command_1 = require("./apptoken.refresh.command");
var AppModule = /** @class */ (function (_super) {
    __extends(AppModule, _super);
    function AppModule() {
        var _this = _super.call(this, '/app') || this;
        _this._commands = [
            new apptoken_create_command_1.AppTokenCreateCommand(),
            new apptoken_remove_command_1.AppTokenRemoveCommand(),
            new apptoken_change_command_1.AppTokenChangeCommand(),
            new apptoken_refresh_command_1.AppTokenRefreshCommand(),
            new apptoken_list_command_1.AppTokenListCommand()
        ];
        return _this;
    }
    return AppModule;
}(command_module_1.CommandModule));
exports.AppModule = AppModule;
