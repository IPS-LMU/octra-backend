import {Injectable} from '@angular/core';
import {SessionStorage} from 'ngx-webstorage';
import {Router} from '@angular/router';
import {OctraAPIService} from '@octra/ngx-octra-api';
import {AccountDto, AccountLoginMethod, AccountRole} from '@octra/api-types';
import {DateTime} from 'luxon';

@Injectable({
  providedIn: 'root'
})
export class AppStorageService {
  get initialized(): boolean {
    return this._initialized;
  }

  @SessionStorage() private _webToken: string | undefined;
  @SessionStorage() private _authType: 'local' | 'shibboleth' | undefined;

  private _user?: AccountDto;

  private _initialized = false;

  public logoutMessage = '';

  get user(): AccountDto | undefined {
    return this._user;
  }

  public get authType(): 'local' | 'shibboleth' | undefined {
    return this._authType;
  }

  get webToken(): string | undefined {
    return this._webToken;
  }

  public lastUpdate = 'test';

  public login(type: AccountLoginMethod, name?: string, password?: string) {
    return this.api.login(type, name, password).then(({accessToken, openURL, account}) => {
      if (openURL !== undefined) {
        // need to open windowURL
        const cid = Date.now();
        const url = `${openURL}?cid=${cid}&r=${encodeURIComponent(document.location.href)}`;
        localStorage.setItem('cid', cid.toString());
        alert('redirect to ' + url)
        document.location.href = url;
      } else if (account) {
        this._user = account;
        this._webToken = accessToken;
        this._authType = type;
        console.log(`navigate because account set`);
        this.router.navigate(['/loading']);
      }
    });
  }

  public logout(message: string = '') {
    this.logoutMessage = message;
    this._webToken = '';
    this.router.navigate(['/login']);
  }

  public initAfterLogin(): Promise<void> {
    this.api.webToken = (this._webToken) ? this._webToken : '';
    return new Promise<void>((resolve, reject) => {
      this.api.getCurrentUserInformation().then((information) => {
        this._user = information;
        this._initialized = true;

        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
  }

  public isAdministrator() {
    return this._user?.generalRole === AccountRole.administrator;
  }

  public readShibbolethAuthToken() {
    const cid = localStorage.getItem(`cid`);

    if (cid) {
      const token = localStorage.getItem(`token_${cid}`);
      this.lastUpdate = DateTime.now().toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);

      if (token) {
        this.lastUpdate = `GOT VALID TOKEN!`;
        console.log(token);
        this._webToken = token;
        this._authType = 'shibboleth';
        localStorage.removeItem(`token_${cid}`);
        this.router.navigate(['/loading']);
      }
      localStorage.removeItem(`cid`);
    }
  }

  constructor(private router: Router, private api: OctraAPIService) {

  }
}
