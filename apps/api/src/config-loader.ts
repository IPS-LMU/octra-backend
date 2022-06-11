import {getConfigPath} from './app/functions';

export class ConfigLoader {
  public static loadConfig() {
    process.env['configPath'] = getConfigPath();
  }
}

ConfigLoader.loadConfig();
