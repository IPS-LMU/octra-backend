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
exports.DeliveryModule = void 0;
var command_module_1 = require("../command.module");
var delivery_media_add_command_1 = require("./delivery.media.add.command");
var DeliveryModule = /** @class */ (function (_super) {
    __extends(DeliveryModule, _super);
    function DeliveryModule() {
        var _this = _super.call(this, '/delivery') || this;
        _this._commands = [
            new delivery_media_add_command_1.DeliveryMediaAddCommand()
        ];
        return _this;
    }
    return DeliveryModule;
}(command_module_1.CommandModule));
exports.DeliveryModule = DeliveryModule;
