var os = require("os");
var fs = require("fs-extra");

if (os.arch() === "arm64") {
  fs.copySync("napi/napi-v6-darwin-arm64", "node_modules/@journeyapps/sqlcipher/lib/binding/napi-v6-darwin-arm64");
}
