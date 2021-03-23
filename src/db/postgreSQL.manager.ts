import {DBManager, InsertQuery, SQLQuery} from './DBManager';
import {Client, QueryResult} from 'pg';
import {IDBConfiguration} from '../obj/app-config/app-config';

/**
 * See https://node-postgres.com/
 */
export class PostgreSQLManager extends DBManager<Client> {
    protected client: Client;

    constructor(dbSettings: IDBConfiguration) {
        super(dbSettings);
    }

    connect(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.client === undefined) {
                this.client = new Client({
                    user: this.dbSettings.dbUser,
                    host: this.dbSettings.dbHost,
                    database: this.dbSettings.dbName,
                    password: this.dbSettings.dbPassword,
                    port: this.dbSettings.dbPort
                });
            }

            if (!this._connected) {
                this.client.connect((err) => {
                    if (err) {
                        console.log('connection error', err.stack);
                        this._connected = false;
                        reject(err);
                    } else {
                        this._connected = true;
                        resolve();
                    }
                });

                this.client.on('end', () => {
                    this._connected = false;
                });
            } else {
                resolve();
            }
        });
    }

    async query(query: SQLQuery): Promise<QueryResult> {
        return this.client.query(query);
    }

    async transaction(queries: SQLQuery[]): Promise<QueryResult> {
        try {
            await this.client.query('BEGIN');

            for (const sqlQuery of queries) {
                await this.client.query(sqlQuery);
            }

            return await this.client.query('COMMIT');
        } catch (e) {
            await this.client.query('ROLLBACK')
            throw e;
        }
    }

    async close() {
        new Promise<void>((resolve, reject) => {
            if (this.client && this._connected) {
                this.client.end().then(resolve).catch(reject);
            } else {
                resolve();
            }
        })
    }

    async insert(query: InsertQuery) {
        const columns = query.columns.filter(a => !(a.value === undefined || a.value === null));

        if (columns.length === 0) {
            throw 'InsertQuery error: columns length is 0.'
        }

        let statement = `${query.tableName}`;
        const variables: any[] = columns.map(a => a.value);
        statement += '(' + columns.map(a => a.key).join(', ') + ')';
        statement += ' values(' + columns.map((a, index) => `$${index + 1}::${a.type}`).join(', ') + ')'

        statement = `insert into ${statement} returning id`;

        return this.query({
            text: statement,
            values: variables
        });
    }
}
