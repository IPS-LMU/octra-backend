"use strict";
exports.__esModule = true;
exports.APIModule = void 0;
var api_1 = require("./api/v1/api");
var APIModule = /** @class */ (function () {
    function APIModule() {
    }
    APIModule.activeAPIs = [
        new api_1.APIV1()
    ];
    return APIModule;
}());
exports.APIModule = APIModule;
