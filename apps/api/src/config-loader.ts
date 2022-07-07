import {getConfigPath} from './app/functions';

export class ConfigLoader {
  public static loadConfig() {
    console.log(`set config path to ${getConfigPath()}`);
    process.env['configPath'] = getConfigPath();
  }
}

ConfigLoader.loadConfig();
