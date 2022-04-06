import * as fs from 'fs-extra';
import {dirname, join} from 'path';
import {Validator} from 'jsonschema';
import {AppConfigurationSchema} from './app-config.schema';
import {environment} from '../../environments/environment';

export type DBType = 'postgres'; // currently PostgreSQL only

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

  public static getInstance() {
    if (!this.configuration) {
      let configPath = '';
      if (environment.production === false) {
        if (process.env.NODE_ENV && process.env.NODE_ENV === 'test') {
          configPath = join(__dirname, '../../', 'config.json');
        } else {
          configPath = join(__dirname, 'config.json');
        }
      } else {
        configPath = join(dirname(process.execPath), 'config.json');
      }
      console.log(`Load config file from ${configPath}...`)
      const validator = new Validator();
      const json = fs.readJSONSync(configPath, 'utf8');
      const validation = validator.validate(json, AppConfigurationSchema);

      if (!validation.valid) {
        throw new Error(`Validation configuration errors found:\n->${validation.errors.map(a => `${a.path}: ${a.message}`).join('\n-> ')}`)
      }
      this.configuration = json;
    }
    return this.configuration;
  }
}
