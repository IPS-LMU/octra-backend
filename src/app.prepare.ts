import * as fsExtra from "fs-extra";

console.log(`Load resources...`);
fsExtra.copySync("./node_modules/bootstrap/dist", "./static/bootstrap");
fsExtra.copySync("./node_modules/anchor-js/anchor.min.js", "./static/bootstrap/js/vendor/anchor.min.js");
fsExtra.copySync("./node_modules/clipboard/dist/clipboard.min.js", "./static/bootstrap/js/vendor/clipboard.min.js");
fsExtra.copySync("./node_modules/jquery/dist/jquery.slim.min.js", "./static/bootstrap/js/vendor/jquery.slim.min.js");
fsExtra.copySync("./node_modules/popper.js/dist/popper.min.js", "./static/bootstrap/js/vendor/popper.min.js");
fsExtra.copySync("./node_modules/holderjs/holder.min.js", "./static/bootstrap/js/vendor/holder.min.js");
