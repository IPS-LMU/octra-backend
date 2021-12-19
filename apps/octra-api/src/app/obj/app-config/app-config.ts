import {Validator, ValidatorResult} from 'jsonschema';
import {AppConfigurationSchema} from './app-config.schema';

export type DBType = 'PostgreSQL'; // currently PostgreSQL only

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
    urlEncryption: {
      secret: string,
      salt: string
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

export class AppConfiguration implements IAppConfiguration {
  get configuration(): IAppConfiguration {
    return this._configuration;
  }

  get version(): string {
    return this._version;
  }

  get validation(): ValidatorResult {
    return this._validation;
  }

  get api(): IAPIConfiguration {
    return this._configuration.api;
  }

  get database(): IDBConfiguration {
    return this._configuration.database;
  }

  private _configuration: IAppConfiguration;
  private _validation: ValidatorResult;
  public appPath: string;
  public uploadPath: string;
  public executionPath: string;
  private _version: string;

  constructor(configuration: IAppConfiguration) {
    const validator = new Validator();
    this._configuration = configuration;
    this._validation = validator.validate(configuration, AppConfigurationSchema);
  }
}
