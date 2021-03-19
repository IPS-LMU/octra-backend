import {OctraApi} from './octra-api';
const environment = 'production';

const app = new OctraApi().init(environment);

module.exports = app;
