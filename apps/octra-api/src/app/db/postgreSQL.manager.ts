import {DBManager, ParameterizedQuery, SQLQuery} from './db.manager';
import {Pool, QueryResult} from 'pg';
import {IDBConfiguration, IDBSSLConfiguration} from '../obj/app-config/app-config';
import * as fs from 'fs';

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
  }

  private loadSSLFileContents(sslConfig: IDBSSLConfiguration) {
    let result: IDBSSLConfiguration;
    if (sslConfig) {
      result = {}
      for (let attr in sslConfig) {
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

  async transaction(queries: SQLQuery[]): Promise<any> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      for (const sqlQuery of queries) {
        await client.query(sqlQuery);
      }

      const result = await client.query('COMMIT');
      client.release();
      return result;
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

    throw 'InsertQuery error: columns length is 0.'
  }

  async update(query: ParameterizedQuery, where: string) {
    const sqlQuery = this.createSQLQueryForUpdate(query, where);
    console.log(sqlQuery.text);
    console.log(sqlQuery.values);
    if (sqlQuery) {
      return this.query(sqlQuery);
    }

    throw 'UpdateQuery error: columns length is 0.'
  }

  public createSQLQueryForInsert(query: ParameterizedQuery, idColumn = 'id'): SQLQuery {
    const columns = query.columns.filter(a => !(a.value === undefined || a.value === null));

    if (columns.length > 0) {
      let statement = `${query.tableName}`;
      const values: any[] = columns.map(a => a.value);
      statement += '(' + columns.map(a => a.key).join(', ') + ')';
      statement += ' values(' + columns.map(
        (a, index) => `$${index + 1}::${a.type}`).join(', ') + ')'

      statement = `insert into ${statement}
                     returning ${idColumn}`;

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
                   where ${where}`;

      return {
        text: statement,
        values
      }
    }
    return null;
  }
}
