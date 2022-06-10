import {environment} from './environments/environment';
import {dirname} from 'path';
import {GlobalVariables} from './app/types';

export class ConfigLoader {
  public static globals: GlobalVariables = {
    nodeModulesPath: './node_modules/',
    basePath: './dist/apps/cli/',
    dataSorceFile: 'datasource.js',
    typeORMPath: ''
  };

  public static loadConfig() {
    if (environment.production) {
      process.env['configPath'] = dirname(process.execPath);
      ConfigLoader.globals.nodeModulesPath = '/snapshot/octra-backend/node_modules/';
      ConfigLoader.globals.basePath = '/snapshot/octra-backend/dist/apps/cli/';
      ConfigLoader.globals.dataSorceFile = 'datasource.prod.js';
    }
  }
}

ConfigLoader.loadConfig();
