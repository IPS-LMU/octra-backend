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
exports.UserModule = void 0;
var command_module_1 = require("../command.module");
var user_password_change_command_1 = require("./user.password.change.command");
var user_list_command_1 = require("./user.list.command");
var user_assign_roles_command_1 = require("./user.assign.roles.command");
var user_login_command_1 = require("./user.login.command");
var user_register_command_1 = require("./user.register.command");
var user_remove_command_1 = require("./user.remove.command");
var user_exists_hash_command_1 = require("./user.exists-hash.command");
var user_info_command_1 = require("./user.info.command");
var user_current_info_command_1 = require("./user.current.info.command");
var UserModule = /** @class */ (function (_super) {
    __extends(UserModule, _super);
    function UserModule() {
        var _this = _super.call(this, '/users') || this;
        _this._commands = [
            new user_login_command_1.UserLoginCommand(),
            new user_register_command_1.UserRegisterCommand(),
            new user_exists_hash_command_1.UserExistsHashCommand(),
            new user_current_info_command_1.UserCurrentInfoCommand(),
            new user_password_change_command_1.UserPasswordChangeCommand(),
            new user_list_command_1.UserListCommand(),
            new user_info_command_1.UserInfoCommand(),
            new user_assign_roles_command_1.UserAssignRolesCommand(),
            new user_remove_command_1.UserRemoveCommand()
        ];
        return _this;
    }
    return UserModule;
}(command_module_1.CommandModule));
exports.UserModule = UserModule;
