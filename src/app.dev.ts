import {OctraApi} from './octra-api';

const environment = 'development';

const app = new OctraApi(environment);

console.log(`\x1b[33m
-----------------------
! Development Build ! |
-----------------------
\x1b[0m`);

module.exports = app;
