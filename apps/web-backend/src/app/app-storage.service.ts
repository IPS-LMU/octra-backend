import {Injectable} from '@angular/core';
import {SessionStorage} from 'ngx-webstorage';
import {Router} from '@angular/router';
import {OctraAPIService} from '@octra/ngx-octra-api';
import {AccountDto, AccountLoginMethod, AccountRole} from '@octra/api-types';

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

  windowChecker: number = -1;
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

  public login(type: AccountLoginMethod, name?: string, password?: string) {
    return this.api.login(type, name, password).then(({accessToken, openURL, account}) => {
      if (openURL !== undefined) {
        // need to open windowURL
        console.log(`open window!`);
        const authWindow = window.open(openURL, '_blank', `top:${(window.outerHeight - 400) / 2},width=600,height=400,titlebar=no,status=no,location=no`);
        if (authWindow) {
          authWindow.addEventListener('beforeunload', () => {
            console.log(`window closed`);
          });

          if (this.windowChecker > -1) {
            clearInterval(this.windowChecker);
          }
          let closed = false;
          this.windowChecker = setInterval(() => {
            if (!closed && authWindow.closed) {
              clearInterval(this.windowChecker);
              this.windowChecker = -1;
              closed = true;

              this.api.retrieveTokenFromWindow(openURL as any).then((token) => {
                this._webToken = token;
                this._authType = type;
                this.router.navigate(['/loading']);
              }).catch((error) => {
                console.error(error);
              });
            }
          }, 1000);
        }
      } else if (account) {
        this._user = account;
        this._webToken = accessToken;
        this._authType = type;
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

  constructor(private router: Router, private api: OctraAPIService) {

  }
}
