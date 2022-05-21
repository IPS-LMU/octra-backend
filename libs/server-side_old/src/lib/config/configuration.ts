import * as fs from 'fs-extra';
import {join} from 'path';
import {Validator} from 'jsonschema';
import {AppConfigurationSchema} from './app-config.schema';

export type DBType = 'postgres' | 'sqlite';

export interface IAppConfiguration {
  version: string;
  database: IDBConfiguration,
  api: IAPIConfiguration,
}

export interface IDBConfiguration {
  dbVersion: string;
  dbType: DBType,
  dbHost: string,
  dbPort: number,
  dbName: string,
  dbUser: string,
  dbPassword: string,
  ssl?: IDBSSLConfiguration
}

export interface IAPIConfiguration {
  url: string,
  baseURL: string,
  host: string,
  port: number,
  debugging?: boolean,
  secret: string,
  passwordSalt: string,
  files: {
    uploadPath: string,
    projectsPath: string;
    urlEncryption: {
      secret: string,
      salt: string
    }
  },
  'reference': {
    'enabled': boolean,
    'protection': {
      'enabled': boolean,
      'username': string,
      'password': string
    }
  },
  shibboleth: {
    secret: string,
    windowURL: string
  }
}

export interface IDBSSLConfiguration {
  rejectUnauthorized?: boolean;
  ca?: string;
  key?: string;
  cert?: string;
}

export class Configuration {
  private static configuration: IAppConfiguration;

  public static getInstance(configPath?: string) {
    if (!this.configuration) {
      configPath = join(configPath ?? '', 'config.json');
      console.log(`Load config file from ${configPath}...`);
      const validator = new Validator();
      const json = fs.readJSONSync(configPath, 'utf8');
      const validation = validator.validate(json, AppConfigurationSchema);

      if (!validation.valid) {
        throw new Error(`Validation configuration errors found:\n->${validation.errors.map(a => `${a.path}: ${a.message}`).join('\n-> ')}`)
      }
      this.configuration = json;
      console.log(`DB Type: ${this.configuration.database.dbType}`);
      console.log(`DB path: ${this.configuration.database.dbName}`);
    }
    return this.configuration;
  }
}
