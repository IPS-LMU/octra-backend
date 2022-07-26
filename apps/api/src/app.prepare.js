const fsExtra = require('fs-extra');

fsExtra.copySync('./node_modules/bootstrap/dist', './dist/apps/api/assets/bootstrap');
fsExtra.copySync('./node_modules/clipboard/dist/clipboard.min.js', './dist/apps/api/assets/bootstrap/js/vendor/clipboard.min.js');
fsExtra.copySync('./node_modules/bootstrap-icons', './dist/apps/api/assets/bootstrap/bootstrap-icons');

const apiJsonText = fsExtra.readFileSync("./apps/api/package.json", {
  encoding: "utf8"
});
const apiJSON = JSON.parse(apiJsonText);

const generatedJsonText = fsExtra.readFileSync("./dist/apps/api/package.json", {
  encoding: "utf8"
});
let generatedJSON = JSON.parse(generatedJsonText);
generatedJSON = {
  ...generatedJSON,
  ...apiJSON
};

fsExtra.writeFileSync("./dist/apps/api/package.json", JSON.stringify(generatedJSON, null, 4), {
  encoding: "utf8"
});
