import {DBManager} from '../../../db/DBManager';
import {AppConfiguration} from '../../../obj/app-config/app-config';
import {randomBytes} from 'crypto';
import {PostgreSQLManager} from '../../../db/postgreSQL.manager';

export class Database {
    private static dbManager: DBManager<any>;
    private static settings: AppConfiguration;

    private static selectAllStatements = {
        appTokens: 'select id::integer, name::text, key::text, domain::text, description::text from apptokens',
        account: 'select id::bigint, username::text, active::boolean, hash::text, training::text, comment::text from account'
    };

    constructor() {
    }

    public static init(_dbManager: DBManager<any>, settings: AppConfiguration) {
        Database.dbManager = _dbManager;
        Database.settings = settings;
    }

    public static async isValidAppToken(token: string, originHost: string): Promise<void> {
        await Database.dbManager.connect();
        const selectResult = await this.dbManager.query({
            text: Database.selectAllStatements.appTokens + ' where key=$1::text',
            values: [token]
        });

        if (selectResult.rowCount === 1) {
            const resultRow = selectResult.rows[0];
            if (resultRow.hasOwnProperty('domain') && resultRow.domain === originHost) {
                return;
            } else {
                throw 'Domain does not match the domain registered for this app key.';
            }
        }

        throw 'Could not find app token';
    }

    public static async createAppToken(data: {
        name: string,
        domain?: string,
        description?: string
    }): Promise<any[]> {
        try {
            await Database.dbManager.connect();
            let token = await Database.generateAppToken();

            const insertionResult = await this.dbManager.query({
                text: 'insert into apptokens(name, key, domain, description) values($1::text, $2::text, $3::text, $4::text) returning id',
                values: [data.name, token, data.domain, data.description]
            });
            if (insertionResult.rowCount === 1 && insertionResult.rows[0].hasOwnProperty('id')) {
                const id = insertionResult.rows[0].id;
                const selectResult = await this.dbManager.query({
                    text: Database.selectAllStatements.appTokens + ' where id=$1',
                    values: [id]
                });
                return selectResult.rows;
            }
            throw "insertionResult does not habe id";
        } catch (e) {
            console.log(`[Error]:`);
            console.log(e);
            throw 'could not generate and save app token';
        }
    }

    public static async removeAppToken(id: number): Promise<void> {
        await Database.dbManager.connect();
        const removeResult = await (this.dbManager as PostgreSQLManager).query({
            text: 'delete from apptokens where id=$1::numeric',
            values: [id]
        });
        if (removeResult.rowCount < 1) {
            throw 'could not remove app token';
        }
        return;
    }

    public static async listAppTokens(): Promise<{
        id: number,
        name: string,
        key: string,
        domain: string,
        description: string
    }[]> {
        await Database.dbManager.connect();
        const selectResult = await this.dbManager.query({
            text: Database.selectAllStatements.appTokens
        });
        return selectResult.rows;
    }

    static async createUser(userData: {
        name: string,
        password: string
    }) {
        await Database.dbManager.connect();
        const insertionResult = await this.dbManager.query({
            text: 'insert into account(username, hash) values($1::text, $2::text) returning id',
            values: [userData.name, userData.password]
        });

        if (insertionResult.rowCount === 1 && insertionResult.rows[0].hasOwnProperty('id')) {
            const selectResult = await this.dbManager.query({
                text: this.selectAllStatements.account + ' where id=$1::numeric',
                values: [insertionResult.rows[0].id]
            });
            if (selectResult.rowCount === 1) {
                return selectResult.rows[0];
            }
        }

        throw 'could not create user';
    }

    static async getUser(id: number) {
        await Database.dbManager.connect();
        const selectResult = await this.dbManager.query({
            text: this.selectAllStatements.account + ' where id=$1::numeric',
            values: [id]
        });

        if (selectResult.rowCount === 1) {
            return selectResult.rows[0];
        }

        throw 'could not find user';
    }

    static async getUserPasswordByName(name: string) {
        await Database.dbManager.connect();
        const selectResult = await this.dbManager.query({
            text: 'select hash::text from account where username=$1::text',
            values: [name]
        });

        if (selectResult.rowCount === 1) {
            return {
                password: selectResult.rows[0].hash,
                id: selectResult.rows[0].id
            };
        }

        throw 'could not find user';
    }

    static async generateAppToken(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            randomBytes(20, function (err, buffer) {
                if (err) {
                    reject(err);
                } else {
                    resolve(buffer.toString('hex'));
                }
            });
        });
    }
}
