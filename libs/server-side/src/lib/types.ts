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
  jwtSalt: string,
  jwtSecret: string,
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
