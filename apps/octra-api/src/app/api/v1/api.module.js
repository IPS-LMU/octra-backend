"use strict";
exports.__esModule = true;
exports.APIV1Module = void 0;
var app_module_1 = require("./commands/app/app.module");
var user_module_1 = require("./commands/user/user.module");
var media_module_1 = require("./commands/media/media.module");
var delivery_module_1 = require("./commands/delivery/delivery.module");
var project_module_1 = require("./commands/project/project.module");
var tool_module_1 = require("./commands/tool/tool.module");
var transcript_module_1 = require("./commands/transcript/transcript.module");
var APIV1Module = /** @class */ (function () {
    function APIV1Module() {
    }
    APIV1Module.modules = [
        new user_module_1.UserModule(),
        new app_module_1.AppModule(),
        new media_module_1.MediaModule(),
        new delivery_module_1.DeliveryModule(),
        new project_module_1.ProjectModule(),
        new tool_module_1.ToolModule(),
        new transcript_module_1.TranscriptModule()
    ];
    return APIV1Module;
}());
exports.APIV1Module = APIV1Module;
