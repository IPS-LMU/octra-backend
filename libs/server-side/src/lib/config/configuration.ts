import * as fs from 'fs-extra';
import {join} from 'path';
import {Validator} from 'jsonschema';
import {AppConfigurationSchema} from './app-config.schema';
import {IAppConfiguration} from '../types';

export class Configuration {
  private static configuration: IAppConfiguration;

  public static getInstance(configPath?: string) {
    if (!this.configuration) {
      configPath = join(configPath ?? '', 'config.json');
      const validator = new Validator();
      const json = fs.readJSONSync(configPath, 'utf8');
      const validation = validator.validate(json, AppConfigurationSchema);

      if (!validation.valid) {
        throw new Error(`Validation configuration errors found (config at ${configPath}):\n->${validation.errors.map(a => `${a.path}: ${a.message}`).join('\n-> ')}`)
      }
      this.configuration = json;
    }
    return this.configuration;
  }

  public static overwrite(apiConfig: IAppConfiguration) {
    this.configuration = apiConfig;
  }
}
