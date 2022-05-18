const fsExtra = require('fs-extra');

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
