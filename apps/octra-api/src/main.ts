import {OctraApi} from './app/octra-api';
import {environment} from './environments/environment';

const app = new OctraApi().init(environment.production ? 'production' : 'development');

module.exports = app;
