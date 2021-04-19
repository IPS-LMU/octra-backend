const fsExtra = require('fs-extra');

fsExtra.copySync('./node_modules/bootstrap/dist', './dist/apps/octra-api/static/bootstrap');
fsExtra.copySync('./node_modules/anchor-js/anchor.min.js', './dist/apps/octra-api/static/bootstrap/js/vendor/anchor.min.js');
fsExtra.copySync('./node_modules/clipboard/dist/clipboard.min.js', './dist/apps/octra-api/static/bootstrap/js/vendor/clipboard.min.js');
fsExtra.copySync('./node_modules/jquery/dist/jquery.min.js', './dist/apps/octra-api/static/bootstrap/js/vendor/jquery.min.js');
fsExtra.copySync('./node_modules/@popperjs/core/dist/umd/popper.min.js', './dist/apps/octra-api/static/bootstrap/js/vendor/popper.min.js');
fsExtra.copySync('./node_modules/holderjs/holder.min.js', './dist/apps/octra-api/static/bootstrap/js/vendor/holder.min.js');

const apiJsonText = fsExtra.readFileSync("./apps/octra-api/package.json", {
  encoding: "utf8"
});
const apiJSON = JSON.parse(apiJsonText);

const generatedJsonText = fsExtra.readFileSync("./dist/apps/octra-api/package.json", {
  encoding: "utf8"
});
let generatedJSON = JSON.parse(generatedJsonText);
generatedJSON = {
  ...generatedJSON,
  ...apiJSON
};

fsExtra.writeFileSync("./dist/apps/octra-api/package.json", JSON.stringify(generatedJSON, null, 4), {
  encoding: "utf8"
});
