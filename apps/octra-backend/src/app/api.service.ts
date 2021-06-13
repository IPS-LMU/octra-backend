import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {SessionStorage} from 'ngx-webstorage';
import {SettingsService} from './settings.service';
import {
  AppTokenListResponse,
  AppTokenRemoveResponse,
  CreateGuidelinesRequest,
  CreateProjectRequest,
  UserLoginResponse
} from '@octra/db';

@Injectable({
  providedIn: 'root'
})
export class APIService {
  get user(): { roles: any[]; name: string; email: string } {
    return this._user;
  }

  get authType(): 'local' | 'shibboleth' | undefined {
    return this._authType;
  }

  get authenticated(): boolean {
    return this._authenticated;
  }

  get webToken(): string {
    return this._webToken;
  }

  private _authenticated = false;
  private _initialized = false;

  get initialized(): boolean {
    return this._initialized;
  }

  get apiURL(): string {
    if (this.settingsService.settings) {
      return this.settingsService.settings.api.url;
    }
    return '';
  }

  get appToken(): string {
    if (this.settingsService.settings) {
      return this.settingsService.settings.api.token;
    }
    return '';
  }

  @SessionStorage() private _webToken = '';
  @SessionStorage() private _authType: 'local' | 'shibboleth' | undefined = undefined;

  private _user = {
    name: '',
    email: '',
    roles: []
  };

  constructor(private settingsService: SettingsService, private http: HttpClient, private router: Router) {
    console.log(`service init`);
  }

  public login(type: 'local' | 'shibboleth', name?: string, password?: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this._authType = type;
      this.http.post(this.apiURL + '/users/login', {
        type, name, password
      }, {
        headers: {
          Authorization: `Bearer ${this.appToken}`
        },
        responseType: 'json'
      }).subscribe((response: any) => {
        const result = response as UserLoginResponse;
        this._authenticated = result.authenticated;
        if (result.authenticated) {
          this._webToken = result.token;
          resolve('');
        } else if (result.data.openURL && result.data.openURL.trim() !== '') {
          resolve(result.data.openURL);
        }
      }, (e) => {
        reject(e.error.message);
      });
    });
  }

  public retrieveTokenFromWindow(windowURL: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.get(windowURL).subscribe((result: any) => {
        if (result.token) {
          this._webToken = result.token;
          resolve();
        } else {
          reject('No web token.')
        }
      }, (e) => {
        reject('HTTP request failed.')
      });
    });
  }

  public logout() {
    this._webToken = '';
    this._authenticated = false;
    this._initialized = false;
    this.router.navigate(['/login']);
  }

  public retrieveAppTokenList(): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      this.http.get(this.apiURL + '/app/tokens', {
        headers: {
          Authorization: `Bearer ${this.appToken}`,
          'x-access-token': this._webToken
        },
        responseType: 'json'
      }).subscribe((response: any) => {
        const result = response as AppTokenListResponse;
        resolve(result.data);
      }, (e) => {
        reject(e.error.message);
      });
    });
  }

  public removeApptoken(id: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.http.delete(`${this.apiURL}/app/tokens/${id}`, {
        headers: {
          Authorization: `Bearer ${this.appToken}`,
          'x-access-token': this._webToken
        },
        responseType: 'json'
      }).subscribe((response) => {
        const result = response as AppTokenRemoveResponse;
        if (result.status === 'success') {
          resolve(true);
        } else {
          reject(result.message);
        }
      }, (e) => {
        reject(e.error.message);
      });
    });
  }

  public createAppToken(tokenData: {
    name: string,
    domain: string,
    description: string,
    registrations: boolean
  }): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.http.post(`${this.apiURL}/app/tokens`, tokenData, {
        headers: {
          Authorization: `Bearer ${this.appToken}`,
          'x-access-token': this._webToken
        },
        responseType: 'json'
      }).subscribe((result: any) => {
        if (result.status === 'success') {
          resolve(true);
        } else {
          reject(result.message);
        }
      }, (e) => {
        reject(e.error.message);
      });
    });
  }


  public changeAppToken(id: number, tokenData: {
    name: string,
    domain: string,
    description: string,
    registrations: boolean
  }): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.http.put(`${this.apiURL}/app/tokens/${id}`, tokenData, {
        headers: {
          Authorization: `Bearer ${this.appToken}`,
          'x-access-token': this._webToken
        },
        responseType: 'json'
      }).subscribe((result: any) => {
        if (result.status === 'success') {
          resolve(true);
        } else {
          reject(result.message);
        }
      }, (e) => {
        reject(e.error.message);
      });
    });
  }

  public refreshAppToken(id: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.http.put(`${this.apiURL}/app/tokens/${id}/refresh`, {}, {
        headers: {
          Authorization: `Bearer ${this.appToken}`,
          'x-access-token': this._webToken
        },
        responseType: 'json'
      }).subscribe((result: any) => {
        if (result.status === 'success') {
          resolve(true);
        } else {
          reject(result.message);
        }
      }, (e) => {
        reject(e.error.message);
      });
    });
  }

  public retrieveTranscript(): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      this.http.get(this.apiURL + '/transcripts/120', {
        headers: {
          Authorization: `Bearer ${this.appToken}`,
          'x-access-token': this._webToken
        },
        responseType: 'json'
      }).subscribe((result: any) => {
        resolve(result.data);
      }, (e) => {
        reject(e.error.message);
      });
    });
  }


  public retrieveTranscripts(): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      this.http.get(this.apiURL + '/projects/transcripts/?projectName=TestProject_1616628350486', {
        headers: {
          Authorization: `Bearer ${this.appToken}`,
          'x-access-token': this._webToken
        },
        responseType: 'json'
      }).subscribe((result: any) => {
        resolve(result.data);
      }, (e) => {
        reject(e.error.message);
      });
    });
  }

  public retrieveUsers(): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      this.http.get(this.apiURL + '/users/', {
        headers: {
          Authorization: `Bearer ${this.appToken}`,
          'x-access-token': this._webToken
        },
        responseType: 'json'
      }).subscribe((result: any) => {
        resolve(result.data);
      }, (e) => {
        reject(e.error.message);
      });
    });
  }

  public getProject(id: number): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.http.get(`${this.apiURL}/projects/${id}`, {
        headers: {
          Authorization: `Bearer ${this.appToken}`,
          'x-access-token': this._webToken
        },
        responseType: 'json'
      }).subscribe((result: any) => {
        resolve(result.data);
      }, (e) => {
        reject(e.error.message);
      });
    });
  }

  public getGuidelines(id: number): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.http.get(`${this.apiURL}/projects/${id}/guidelines`, {
        headers: {
          Authorization: `Bearer ${this.appToken}`,
          'x-access-token': this._webToken
        },
        responseType: 'json'
      }).subscribe((result: any) => {
        resolve(result.data);
      }, (e) => {
        reject(e.error.message);
      });
    });
  }

  public retrieveProjects(): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      this.http.get(this.apiURL + '/projects/', {
        headers: {
          Authorization: `Bearer ${this.appToken}`,
          'x-access-token': this._webToken
        },
        responseType: 'json'
      }).subscribe((result: any) => {
        resolve(result.data);
      }, (e) => {
        reject(e.error.message);
      });
    });
  }

  public createProject(projectData: CreateProjectRequest): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.http.post(`${this.apiURL}/projects`, projectData, {
        headers: {
          Authorization: `Bearer ${this.appToken}`,
          'x-access-token': this._webToken
        },
        responseType: 'json'
      }).subscribe((result: any) => {
        if (result.status === 'success') {
          resolve(result.id);
        } else {
          reject(result.message);
        }
      }, (e) => {
        reject(e.error.message);
      });
    });
  }

  public changeProject(id: number, requestData: CreateProjectRequest): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.put(`${this.apiURL}/projects/${id}`, requestData, {
        headers: {
          Authorization: `Bearer ${this.appToken}`,
          'x-access-token': this._webToken
        },
        responseType: 'json'
      }).subscribe((result: any) => {
        if (result.status === 'success') {
          resolve();
        } else {
          reject(result.message);
        }
      }, (e) => {
        reject(e.error.message);
      });
    });
  }

  public saveGuidelines(projectID: number, requestData: CreateGuidelinesRequest[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.put(`${this.apiURL}/projects/${projectID}/guidelines`, requestData, {
        headers: {
          Authorization: `Bearer ${this.appToken}`,
          'x-access-token': this._webToken
        },
        responseType: 'json'
      }).subscribe((result: any) => {
        if (result.status === 'success') {
          resolve();
        } else {
          reject(result.message);
        }
      }, (e) => {
        reject(e.error.message);
      });
    });
  }

  public removeProject(id: number, reqData: any): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      let options = '';
      if (reqData.cutAllReferences) {
        options = '?cutAllReferences=true';
      } else if (reqData.removeAllReferences) {
        options = '?removeAllReferences=true';
      }

      this.http.delete(`${this.apiURL}/projects/${id}/${options}`, {
        headers: {
          Authorization: `Bearer ${this.appToken}`,
          'x-access-token': this._webToken
        },
        responseType: 'json'
      }).subscribe((result: any) => {
        if (result.status === 'success') {
          resolve(true);
        } else {
          reject(result.message);
        }
      }, (e) => {
        reject(e.error.message);
      });
    });
  }

  public changePassword(oldPassword: string, password: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.http.put(this.apiURL + '/users/password', {
          oldPassword,
          password
        },
        {
          headers: {
            Authorization: `Bearer ${this.appToken}`,
            'x-access-token': this._webToken
          },
          responseType: 'json'
        }).subscribe((result: any) => {
        resolve(result);
      }, (e) => {
        reject(e.error.message);
      });
    });
  }


  public getUserInfo(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.http.get(this.apiURL + '/users/current',
        {
          headers: {
            Authorization: `Bearer ${this.appToken}`,
            'x-access-token': this._webToken
          },
          responseType: 'json'
        }).subscribe((result: any) => {
        resolve(result.data);
      }, (e) => {
        reject(e.error.message);
      });
    });
  }

  public initAfterLogin(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.getUserInfo().then((information) => {
        this._user.name = information.username;
        this._user.email = information.email;
        this._user.roles = information.roles;
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
}
