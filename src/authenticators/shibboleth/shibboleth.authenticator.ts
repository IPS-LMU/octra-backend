import {Authenticator} from '../authenticator';

export abstract class ShibbolethAuthenticator extends Authenticator {
    public async isAuthenticated(data: any) {
        return true;
    }
}
