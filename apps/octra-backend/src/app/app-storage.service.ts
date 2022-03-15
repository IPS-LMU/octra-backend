import {Injectable} from '@angular/core';
import {SessionStorage} from 'ngx-webstorage';
import {Router} from '@angular/router';
import {OctraAPIService} from '@octra/ngx-octra-api';
import {UserRole} from '@octra/db';

@Injectable({
  providedIn: 'root'
})
export class AppStorageService {
  get initialized(): boolean {
    return this._initialized;
  }

  @SessionStorage() private _webToken: string | undefined;
  @SessionStorage() private _authType: 'local' | 'shibboleth' | undefined;

  private _user: {
    name: string;
    email: string;
    roles: UserRole[];
  } = {
    name: '',
    email: '',
    roles: []
  };

  windowChecker: number = -1;
  private _initialized = false;

  get user(): { roles: any[]; name: string; email: string } {
    return this._user;
  }

  public get authType(): 'local' | 'shibboleth' | undefined {
    return this._authType;
  }

  get webToken(): string | undefined {
    return this._webToken;
  }

  public login(type: 'local' | 'shibboleth', name?: string, password?: string) {
    return this.api.loginUser(type, name, password).then((result) => {
      if (result.openWindowURL !== undefined) {
        // need to open windowURL
        console.log(`open window!`);
        const authWindow = window.open(result.openWindowURL, '_blank', `top:${(window.outerHeight - 400) / 2},width=600,height=400,titlebar=no,status=no,location=no`);
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

              this.api.retrieveTokenFromWindow(result.openWindowURL as any).then((token) => {
                this._webToken = token;
                this._authType = type;
                this.router.navigate(['/loading']);
              }).catch((error) => {
                console.error(error);
              });
            }
          }, 1000);
        }
      } else if (result.user) {
        this._user = {
          name: result.user.name,
          email: result.user.email,
          roles: result.user.roles
        };
        this._webToken = result.user.jwt;
        this._authType = type;
        this.router.navigate(['/loading']);
      }
    });
  }

  public logout() {
    this._webToken = '';
    this.router.navigate(['/login']);
  }

  public initAfterLogin(): Promise<void> {
    this.api.webToken = (this._webToken) ? this._webToken : '';
    return new Promise<void>((resolve, reject) => {
      this.api.getCurrentUserInformation().then((information) => {
        this._user.name = information.username;
        this._user.email = information.email;
        this._user.roles = (information.roles) ? information.roles : [];
        this._initialized = true;

        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
  }

  public isAdministrator() {
    return this._user.roles.find(a => a === 'administrator') !== undefined;
  }

  constructor(private router: Router, private api: OctraAPIService) {

  }
}
