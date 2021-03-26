import * as fsExtra from 'fs-extra';
import {OctraApi} from './octra-api';

const octraAPI = new OctraApi();

// copy reference folders to api forlder in views
fsExtra.copySync('./views', './build/views');
fsExtra.copySync('./static', './build/static');

for (const api of octraAPI.activeAPIs) {
    fsExtra.copySync('./src/api/' + api.information.apiSlug + '/reference', './build/views/api/' + api.information.apiSlug);
    fsExtra.moveSync('./build/views/api/' + api.information.apiSlug + '/static', './build/static/' + api.information.apiSlug);
}

fsExtra.copySync('./src/authenticators/shibboleth/index.ejs', './build/views/authenticators/shibboleth/index.ejs');
fsExtra.copySync('./src/authenticators/shibboleth/static/style.css', './build/static/authenticators/shibboleth/style.css');

fsExtra.copySync('./config.json', './build/config.json');

fsExtra.copySync('./node_modules/bootstrap/dist', './build/static/bootstrap');
fsExtra.copySync('./node_modules/bootstrap-icons/font', './build/static/bootstrap/bootstrap-icons');
fsExtra.copySync('./node_modules/anchor-js/anchor.min.js', './build/static/bootstrap/js/vendor/anchor.min.js');
fsExtra.copySync('./node_modules/clipboard/dist/clipboard.min.js', './build/static/bootstrap/js/vendor/clipboard.min.js');
fsExtra.copySync('./node_modules/jquery/dist/jquery.min.js', './build/static/bootstrap/js/vendor/jquery.min.js');
fsExtra.copySync('./node_modules/popper.js/dist/popper.min.js', './build/static/bootstrap/js/vendor/popper.min.js');
fsExtra.copySync('./node_modules/holderjs/holder.min.js', './build/static/bootstrap/js/vendor/holder.min.js');
