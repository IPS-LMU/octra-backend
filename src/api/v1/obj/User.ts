export class User {
    get name(): string {
        return this._name;
    }

    get email(): string {
        return this._email;
    }

    get password(): string {
        return this._password;
    }

    constructor(private _name: string, private _email: string, private _password: string) {

    }
}
