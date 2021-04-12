import {Authenticator} from '../authenticator';
import {http, https} from 'follow-redirects';

export class ShibbolethAuthenticator extends Authenticator {
    private cookie = {
        key: '',
        value: ''
    };

    constructor(apiURL: string, cookies: any) {
        super('Shibboleth', apiURL, cookies);
        this._authURL = `${apiURL}/authShibboleth`;

        if (cookies) {
            for (let attr in cookies) {
                if (cookies.hasOwnProperty(attr)) {
                    if (attr.indexOf('_shibsession_') > -1) {
                        this.cookie.key = attr;
                        this.cookie.value = cookies[attr];
                        this._uid = attr.replace('_shibsession_', '');
                        this._isActive = true;
                        break;
                    }
                }
            }
        }
    }

    public async isAuthenticated(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            let ended = false;
            setTimeout(() => {
                if (!ended) {
                    ended = true;
                    reject('timeout');
                }
            }, 3000);

            const httpClient = (this._authURL.indexOf('https') > -1) ? https : http;
            const request = httpClient.get(this._authURL, {
                headers: {
                    Cookie: `${this.cookie.key}=${this.cookie.value}`
                }
            }, (response) => {
                if (!ended) {
                    ended = true;
                    resolve(response.statusCode === 200);
                }
            });
            request.on('error', error => {
                reject(error)
            });
        });
    }
}
