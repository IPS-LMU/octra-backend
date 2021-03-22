import {DBManager} from '../../../db/DBManager';
import {AppConfiguration} from '../../../obj/app-config/app-config';
import {randomBytes} from 'crypto';

export class Database {
    private static dbManager: DBManager<any>;
    private static settings: AppConfiguration;

    constructor() {
    }

    public static init(_dbManager: DBManager<any>, settings: AppConfiguration) {
        Database.dbManager = _dbManager;
        Database.settings = settings;
    }

    public static async isValidAppToken(token: string, originHost: string): Promise<void> {
        await Database.dbManager.connect();
        const selectResult = await this.dbManager.query({
            text: 'select * from apptokens where key=$1::text',
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
                const selectResult = await this.dbManager.query({
                    text: 'select * from apptokens where id=$1::numeric',
                    values: [insertionResult.rows[0].id]
                });
                return selectResult.rows;
            }
        } catch (e) {
            console.log(`[Error]:`);
            console.log(e);
            throw 'could not generate and save app token';
        }
    }

    public static async listAppTokens(): Promise<any[]> {
        await Database.dbManager.connect();
        const selectResult = await this.dbManager.query({
            text: 'select * from apptokens'
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
                text: 'select * from account where id=$1::numeric',
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
            text: 'select * from account where id=$1::numeric',
            values: [id]
        });

        if (selectResult.rowCount === 1) {
            return selectResult.rows[0];
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
