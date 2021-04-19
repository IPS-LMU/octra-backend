export abstract class Authenticator {
    get authURL(): string {
        return this._authURL;
    }
    get uid(): string {
        return this._uid;
    }

    get isActive(): boolean {
        return this._isActive;
    }

    get cookies(): any {
        return this._cookies;
    }

    get name(): string {
        return this._name;
    }

    protected _apiURL: string;
    protected _authURL: string;
    protected _name: string;
    protected _cookies: any;
    protected _isActive: boolean;
    protected _uid = '';

    public abstract isAuthenticated(): Promise<boolean>;

    constructor(name: string, apiURL: string, cookies: any) {
        this._name = name;
        this._apiURL = apiURL;
        this._cookies = cookies;
    }
}
