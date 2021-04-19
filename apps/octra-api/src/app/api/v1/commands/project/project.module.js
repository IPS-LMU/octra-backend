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
exports.ProjectModule = void 0;
var command_module_1 = require("../command.module");
var project_create_command_1 = require("./project.create.command");
var project_transcripts_get_command_1 = require("./project.transcripts.get.command");
var ProjectModule = /** @class */ (function (_super) {
    __extends(ProjectModule, _super);
    function ProjectModule() {
        var _this = _super.call(this, '/projects') || this;
        _this._commands = [
            new project_transcripts_get_command_1.ProjectTranscriptsGetCommand(),
            new project_create_command_1.ProjectCreateCommand()
        ];
        return _this;
    }
    return ProjectModule;
}(command_module_1.CommandModule));
exports.ProjectModule = ProjectModule;
