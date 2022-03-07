import {DBManager, ParameterizedQuery, SQLQuery} from './db.manager';
import {Pool, QueryResult, types} from 'pg';
import {IDBConfiguration, IDBSSLConfiguration} from '../obj/app-config/app-config';
import * as fs from 'fs';
import {DatabaseRow} from '@octra/db';

/**
 * See https://node-postgres.com/
 */
export class PostgreSQLManager extends DBManager {
  protected pool: Pool;

  constructor(dbSettings: IDBConfiguration) {
    super(dbSettings);


    const ssl = this.loadSSLFileContents(dbSettings.ssl);

    this.pool = new Pool({
      user: this.dbSettings.dbUser,
      host: this.dbSettings.dbHost,
      database: this.dbSettings.dbName,
      password: this.dbSettings.dbPassword,
      port: this.dbSettings.dbPort,
      ssl
    });
    types.setTypeParser(TypeId.TIMESTAMP, str => str);
    types.setTypeParser(TypeId.TIMESTAMPTZ, str => str);
    types.setTypeParser(TypeId.INT8, (val) => {
      return Number(val);
    });
  }

  private loadSSLFileContents(sslConfig: IDBSSLConfiguration) {
    let result: IDBSSLConfiguration;
    if (sslConfig) {
      result = {}
      for (const attr in sslConfig) {
        if (sslConfig.hasOwnProperty(attr) && sslConfig[attr] && sslConfig[attr] !== '') {
          if (fs.existsSync(sslConfig[attr])) {
            result[attr] = fs.readFileSync(sslConfig[attr], {encoding: 'utf-8'});
          }
        }
      }
    }
    return result;
  }

  connect(): Promise<any> {
    return this.pool.connect();
  }

  async query(query: SQLQuery): Promise<QueryResult> {
    return new Promise<QueryResult>((resolve, reject) => {
      this.pool.query(query).then((result) => {
        resolve(result);
      }).catch((error) => {
        reject(error);
      });
    })
  }

  async transaction(queries: SQLQuery[]): Promise<DatabaseRow[][]> {
    // allow dry run
    const client = await this.pool.connect();
    const results: DatabaseRow[][] = []

    try {
      await client.query('BEGIN');

      for (const sqlQuery of queries) {
        const t = await client.query(sqlQuery);
        results.push(t.rows as DatabaseRow[]);
      }

      await client.query('COMMIT');
      client.release();
      return results;
    } catch (e) {
      // Make sure to release the client before any error handling,
      // just in case the error handling itself throws an error.
      client.release()
      await client.query('ROLLBACK')
      throw e;
    } finally {
    }
  }

  async close() {
    return this.pool.end();
  }

  async insert(query: ParameterizedQuery, idColumn = 'id') {
    const sqlQuery = this.createSQLQueryForInsert(query, idColumn);

    if (sqlQuery) {
      return this.query(sqlQuery);
    }

    throw new Error('InsertQuery error: columns length is 0.')
  }

  async update(query: ParameterizedQuery, where: string) {
    const sqlQuery = this.createSQLQueryForUpdate(query, where);
    console.log(sqlQuery.text);
    console.log(sqlQuery.values);
    if (sqlQuery) {
      return this.query(sqlQuery);
    }

    throw new Error('UpdateQuery error: columns length is 0.')
  }

  public createSQLQueryForInsert(query: ParameterizedQuery, idColumn = 'id'): SQLQuery {
    const columns = query.columns.filter(a => !(a.value === undefined || a.value === null));

    if (columns.length > 0) {
      let statement = `${query.tableName}`;
      const values: any[] = columns.filter(a => a.type !== undefined).map(a => a.value);
      statement += '(' + columns.map(a => a.key).join(', ') + ')';
      let j = 0;
      statement += ' values(' + columns.map(
        (a, index) => {
          if (!a.type) {
            return a.value;
          }
          j++;
          return `$${j}${a.type ? '::' + a.type : ''}`;
        }).join(', ') + ')';

      statement = `insert into ${statement}${(idColumn !== '') ? ` returning ${idColumn}` : ''}`;

      return {
        text: statement,
        values
      }
    }
    return null;
  }

  public createSQLQueryForUpdate(query: ParameterizedQuery, where: string): SQLQuery {
    const columns = query.columns.filter(a => !(a.value === undefined || a.value === null));

    if (columns.length > 0) {
      let statement = '';
      const values: any[] = columns.filter(a => a.type !== '' && a.type !== null && a.type !== undefined).map(a => a.value);
      let k = 0;

      statement += columns.map((a, i) => {
        if (a.type && a.type !== '') {
          k++;
          return `${a.key}=$${k}::${a.type}`
        }

        return `${a.key}=${a.value}`
      }).join(', ');

      statement = `update ${query.tableName}
                   set ${statement}
                   where ${where}
                   returning *`;

      return {
        text: statement,
        values
      }
    }
    return null;
  }
}


export enum TypeId {
  BOOL = 16,
  BYTEA = 17,
  CHAR = 18,
  INT8 = 20,
  INT2 = 21,
  INT4 = 23,
  REGPROC = 24,
  TEXT = 25,
  OID = 26,
  TID = 27,
  XID = 28,
  CID = 29,
  JSON = 114,
  XML = 142,
  PG_NODE_TREE = 194,
  SMGR = 210,
  PATH = 602,
  POLYGON = 604,
  CIDR = 650,
  FLOAT4 = 700,
  FLOAT8 = 701,
  ABSTIME = 702,
  RELTIME = 703,
  TINTERVAL = 704,
  CIRCLE = 718,
  MACADDR8 = 774,
  MONEY = 790,
  MACADDR = 829,
  INET = 869,
  ACLITEM = 1033,
  BPCHAR = 1042,
  VARCHAR = 1043,
  DATE = 1082,
  TIME = 1083,
  TIMESTAMP = 1114,
  TIMESTAMPTZ = 1184,
  INTERVAL = 1186,
  TIMETZ = 1266,
  BIT = 1560,
  VARBIT = 1562,
  NUMERIC = 1700,
  REFCURSOR = 1790,
  REGPROCEDURE = 2202,
  REGOPER = 2203,
  REGOPERATOR = 2204,
  REGCLASS = 2205,
  REGTYPE = 2206,
  UUID = 2950,
  TXID_SNAPSHOT = 2970,
  PG_LSN = 3220,
  PG_NDISTINCT = 3361,
  PG_DEPENDENCIES = 3402,
  TSVECTOR = 3614,
  TSQUERY = 3615,
  GTSVECTOR = 3642,
  REGCONFIG = 3734,
  REGDICTIONARY = 3769,
  JSONB = 3802,
  REGNAMESPACE = 4089,
  REGROLE = 4096
}
