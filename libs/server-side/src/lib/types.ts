export type DBType = 'postgres' | 'sqlite';

export interface IAppConfiguration {
  version: string;
  database: IDBConfiguration,
  api: IAPIConfiguration,
}

export interface IDBConfiguration {
  dbType: DBType,
  dbHost: string,
  dbPort: number,
  dbName: string,
  dbUser: string,
  dbPassword: string,
  ssl?: IDBSSLConfiguration
}

export interface SecretSaltPair {
  secret: string;
  salt: string;
}

export interface IAPIConfiguration {
  url: string,
  baseURL: string,
  host: string,
  port: number,
  debugging?: boolean,
  paths: {
    projectsFolder: string;
    uploadFolder: string;
  },
  performance?: {
    cluster?: {
      enabled: boolean;
      maxParallelWorkers: number;
    }
  },
  security: {
    trustProxy?: boolean;
    keys: {
      password: SecretSaltPair;
      jwt: SecretSaltPair;
      url: SecretSaltPair;
    }
  },
  plugins?: {
    reference?: {
      enabled: boolean;
      protection?: {
        enabled: boolean;
        username: string;
        password: string;
      }
    },
    shibboleth?: {
      enabled: boolean;
      secret: string;
      uuidSalt: string;
      windowURL: string;
    },
    webBackend?: {
      enabled: boolean;
      appToken: string;
      url: string;
    }
  }
}

export interface IDBSSLConfiguration {
  rejectUnauthorized?: boolean;
  ca?: string;
  key?: string;
  cert?: string;
}
