import {Injectable} from '@angular/core';
import {SessionStorage} from 'ngx-webstorage';
import {Router} from '@angular/router';
import {OctraAPIService} from '@octra/ngx-octra-api';
import {AccountDto, AccountLoginMethod, AccountRole} from '@octra/api-types';
import {SettingsService} from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class AppStorageService {
  get authenticated(): boolean | undefined {
    return this._authenticated;
  }

  get initialized(): boolean {
    return this._initialized;
  }

  @SessionStorage() private _authenticated?: boolean;
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

  public login(type: AccountLoginMethod, name?: string, password?: string) {
    return this.api.login(type, name, password).then(({accessToken, openURL, account}) => {
      if (openURL !== undefined) {
        // need to open windowURL
        const cid = Date.now();
        const url = `${openURL}?cid=${cid}&r=${encodeURIComponent(document.location.href)}`;
        localStorage.setItem('cid', cid.toString());
        document.location.href = url;
        this._authenticated = false;
      } else if (account) {
        this._user = account;
        this._authType = type;
        this._authenticated = true;
        this.settingsService.webToken = accessToken;
        console.log(`navigate because account set`);
        this.router.navigate(['/loading']);
      }
    });
  }

  public logout(message: string = '') {
    this.api.logout().then(() => {
      this.logoutMessage = message;
      this._authenticated = false;
      this.router.navigate(['/login']);
    }).catch((e) => {
      alert('error occurred:\n' + e);
    });
  }

  public initAfterLogin(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.api.getCurrentUserInformation().then((information) => {
        this._authenticated = true;
        this._user = information;
        this._initialized = true;

        resolve();
      }).catch((error) => {
        this._authenticated = false;
        reject(error);
      });
    });
  }

  public isAdministrator() {
    return this._user?.generalRole === AccountRole.administrator;
  }

  public autoLogin(method: AccountLoginMethod) {
    this._authType = method;
    this._authenticated = true;
    this.router.navigate(['/loading']);
  }

  constructor(private router: Router, private api: OctraAPIService, private settingsService: SettingsService) {

  }
}
