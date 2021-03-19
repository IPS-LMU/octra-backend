import {DBManager, SQLQuery} from './DBManager';
import {Client, Result} from 'pg';
import {IDBConfiguration} from '../obj/app-config/app-config';

/**
 * See https://node-postgres.com/
 */
export class PostgreSQLManager extends DBManager<Client, Result> {
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
                        console.error('connection error', err.stack);
                        this._connected = false;
                        reject(err);
                    } else {
                        console.log('connected')
                        this._connected = true;
                        resolve();
                    }
                });

                this.client.on('end', () => {
                    console.log(`client closed!`);
                    this._connected = false;
                });
            } else {
                console.log(`already connected`);
                resolve();
            }
        });
    }

    async query(query: SQLQuery): Promise<Result> {
        return this.client.query(query);
    }

    async transaction(queries: SQLQuery[]): Promise<void> {
        try {
            await this.client.query('BEGIN');

            for (const sqlQuery of queries) {
                await this.client.query(sqlQuery);
            }

            await this.client.query('COMMIT');
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
}
