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
exports.TranscriptModule = void 0;
var command_module_1 = require("../command.module");
var transcript_add_command_1 = require("./transcript.add.command");
var transcript_get_command_1 = require("./transcript.get.command");
var TranscriptModule = /** @class */ (function (_super) {
    __extends(TranscriptModule, _super);
    function TranscriptModule() {
        var _this = _super.call(this, '/transcripts') || this;
        _this._commands = [
            new transcript_add_command_1.TranscriptAddCommand(),
            new transcript_get_command_1.TranscriptGetCommand()
        ];
        return _this;
    }
    return TranscriptModule;
}(command_module_1.CommandModule));
exports.TranscriptModule = TranscriptModule;
