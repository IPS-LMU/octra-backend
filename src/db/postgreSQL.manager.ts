import {DBManager, InsertQuery, SQLQuery} from './DBManager';
import {Pool, QueryResult} from 'pg';
import {IDBConfiguration} from '../obj/app-config/app-config';

/**
 * See https://node-postgres.com/
 */
export class PostgreSQLManager extends DBManager {
    protected pool: Pool;

    constructor(dbSettings: IDBConfiguration) {
        super(dbSettings);
        this.pool = new Pool({
            user: this.dbSettings.dbUser,
            host: this.dbSettings.dbHost,
            database: this.dbSettings.dbName,
            password: this.dbSettings.dbPassword,
            port: this.dbSettings.dbPort
        });
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

    async insert(query: InsertQuery, idColumn = 'id') {
        const sqlQuery = this.createSQLQueryForInsert(query, idColumn);

        if (sqlQuery) {
            return this.query(sqlQuery);
        }

        throw 'InsertQuery error: columns length is 0.'
    }

    public createSQLQueryForInsert(query: InsertQuery, idColumn = 'id'): SQLQuery {
        const columns = query.columns.filter(a => !(a.value === undefined || a.value === null));

        if (columns.length > 0) {
            let statement = `${query.tableName}`;
            const values: any[] = columns.map(a => a.value);
            statement += '(' + columns.map(a => a.key).join(', ') + ')';
            statement += ' values(' + columns.map(
                (a, index) => `$${index + 1}::${a.type}`).join(', ') + ')'

            statement = `insert into ${statement} returning ${idColumn}`;

            return {
                text: statement,
                values
            }
        }
        return null;
    }
}
