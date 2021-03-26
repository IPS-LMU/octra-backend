export abstract class Authenticator {
    public abstract isAuthenticated(data: any): Promise<boolean>;
}
