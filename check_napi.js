var os = require("os");
var fs = require("fs");

if (os.arch() === "arm64") {
  fs.copyFileSync("node_modules/better-sqlite3/build/Release/better_sqlite3.node", "napi/better_sqlite3-darwin-arm64.node");
  fs.copyFileSync("napi/better_sqlite3-darwin-arm64.node", "node_modules/better-sqlite3/build/Release/better_sqlite3-darwin-arm64.node");
}
