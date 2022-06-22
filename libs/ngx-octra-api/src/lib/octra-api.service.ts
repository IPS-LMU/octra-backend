import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {
  AccountDto,
  AccountLoginMethod,
  AppTokenChangeDto,
  AppTokenCreateDto,
  AppTokenDto,
  AuthDto,
  GuidelinesDto,
  ProjectDto,
  ProjectRequestDto,
  SaveAnnotationDto,
  TaskDto,
  TaskUploadDto
} from '@octra/api-types';
import {firstValueFrom} from 'rxjs';
import {removeNullAttributes} from './functions';

@Injectable({
  providedIn: 'root'
})
export class OctraAPIService {
  set webToken(value: string) {
    this._webToken = value;
  }

  private appToken = '';
  private _webToken = '';
  private apiURL = '';

  get initialized(): boolean {
    return this._initialized;
  }

  private _initialized = false;
  private _authenticated = false;

  constructor(private http: HttpClient) {
  }

  public init(apiURL: string, appToken: string) {
    this.apiURL = apiURL;
    console.log(`initialized api url`);
    this.appToken = appToken;
    this._initialized = true;
  }

  public async login(type: AccountLoginMethod, username?: string, password?: string) {
    console.log(`LOGIN TEST`);
    return new Promise<AuthDto>((resolve, reject) => {
      let data: any = {
        type, username, password
      };
      data = removeNullAttributes(data);
      firstValueFrom(this.http.post<AuthDto>(`${this.apiURL}/auth/login`, data, {
        headers: this.getHeaders(false)
      })).then((result: AuthDto) => {
        if (!result.openURL && result.accessToken) {
          this._webToken = result.accessToken;
          resolve(result);
        } else if (result.openURL && result.openURL.trim() !== '') {
          resolve(result);
        } else {
          reject('Can\'t read login response');
        }
      }).catch((error) => {
        reject((error.error?.message) ? error.error.message : error.message);
      });
    });
  }

  /***
   * retrieves the jwt from the authentication window.
   * @param windowURL
   */
  public async retrieveTokenFromWindow(windowURL: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.http.get(windowURL).subscribe((result: any) => {
        if (result.token) {
          this._webToken = result.token;
          resolve(this._webToken);
        } else {
          reject('No web token.')
        }
      }, (e) => {
        reject('HTTP request failed.')
      });
    });
  }

  /**
   * does logout process
   */
  public logout() {
    this._webToken = '';
    this._authenticated = false;
  }

  /***
   * lists the app tokens.
   */
  public async listAppTokens(): Promise<AppTokenDto[]> {
    return this.get('/app/tokens', true);
  }

  /***
   * returns one specific apptoken.
   */
  public async getAppToken(id: string): Promise<AppTokenDto> {
    return this.get(`/app/tokens/${id}`, true);
  }

  public async getTask(projectID: number, taskID: number): Promise<TaskDto> {
    return this.get(`/projects/${projectID}/tasks/${taskID}`, true);
  }

  public async listTasks(projectID: string): Promise<TaskDto[]> {
    return this.get(`/projects/${projectID}/tasks/`, true);
  }

  public async removeAppToken(id: string): Promise<void> {
    return this.delete(`/app/tokens/${id}`, true);
  }

  public async getProject(id: string): Promise<ProjectDto> {
    return this.get(`/projects/${id}`, true);
  }

  public async getGuidelines(id: string): Promise<GuidelinesDto[]> {
    return this.get(`/projects/${id}/guidelines`, true);
  }

  public async listAccounts(): Promise<AccountDto[]> {
    return this.get('/account/', true);
  }

  public async listProjects(): Promise<ProjectDto[]> {
    return this.get('/projects/', true);
  }

  public async createProject(projectData: ProjectRequestDto): Promise<ProjectDto> {
    return this.post(`/projects`, projectData, true);
  }

  public async saveGuidelines(projectID: string, requestData: GuidelinesDto[]): Promise<void> {
    return this.put(`/projects/${projectID}/guidelines`, requestData, true);
  }

  public async removeProject(id: string, reqData: {
    cutAllReferences?: boolean;
    removeAllReferences?: boolean;
    removeProjectFiles?: boolean;
  }): Promise<void> {
    return this.delete(`/projects/${id}/`, true, reqData);
  }

  public async changeMyPassword(oldPassword: string, password: string): Promise<void> {
    return this.put('/account/password', {
      oldPassword,
      password
    }, true);
  }

  public async getCurrentUserInformation(): Promise<AccountDto> {
    return this.get('/account/current', true);
  }

  public async changeProject(id: string, requestData: ProjectRequestDto): Promise<void> {
    return this.put(`/projects/${id}`, requestData, true);
  }

  public async createAppToken(tokenData: AppTokenCreateDto): Promise<boolean> {
    return this.post<any>(`/app/tokens`, tokenData, true);
  }

  public async changeAppToken(id: string, tokenData: AppTokenChangeDto): Promise<AppTokenDto> {
    return this.put(`/app/tokens/${id}`, tokenData, true);
  }

  public async refreshAppToken(id: string): Promise<AppTokenDto> {
    return this.put(`/app/tokens/${id}/refresh`, {}, true);
  }

  public async startAnnotation(projectID: string): Promise<any> { //TODO add missing annotation dto
    return this.post(`/projects/${projectID}/annotations/start`, {}, true);
  }

  public async freeAnnotation(projectID: string, annotationID: number): Promise<any> {
    return this.post(`/projects/${projectID}/annotations/${annotationID}/free`, {}, true);
  }

  public async saveAnnotation(projectID: string, annotationID: number, data: SaveAnnotationDto): Promise<TaskDto> {
    return this.post(`/projects/${projectID}/annotations/${annotationID}/save`, data, true);
  }

  public async deliverTaskData(projectID: string, file: File, data: TaskUploadDto): Promise<TaskDto> {
    return this.post(`/media/`, data, true);
  }

  public async uploadTaskData(file: File, data: TaskUploadDto): Promise<TaskDto | undefined> {
    const formData = new FormData();
    formData.append('media', file);
    // data = (!(typeof data === 'string')) ? JSON.stringify(data) : data;
    // formData.append('data', new File([data], 'data.json', {type: 'application/json'}));
    // return this.post(`delivery/media/upload`, formData, true);
    return undefined;
  }

  private async get<T>(partURL: string, needsJWT: boolean): Promise<T> {
    const headers = this.getHeaders(needsJWT);
    partURL = (partURL.indexOf('/') === 0) ? partURL.substr(1) : partURL;
    return firstValueFrom(this.http.get<T>(`${this.apiURL}/${partURL}`, {
      responseType: 'json',
      headers
    }));
  }

  private async post<T>(partURL: string, data: any, needsJWT: boolean): Promise<T> {
    const headers = this.getHeaders(needsJWT);
    partURL = (partURL.indexOf('/') === 0) ? partURL.substr(1) : partURL;
    return firstValueFrom(this.http.post<T>(`${this.apiURL}/${partURL}`, data, {
      responseType: 'json',
      headers
    }));
  }

  private async put<T>(partURL: string, data: any, needsJWT: boolean): Promise<T> {
    const headers = this.getHeaders(needsJWT);
    partURL = (partURL.indexOf('/') === 0) ? partURL.substr(1) : partURL;
    return firstValueFrom(this.http.put<T>(`${this.apiURL}/${partURL}`, data, {
      responseType: 'json',
      headers
    }));
  }

  private async delete<T>(partURL: string, needsJWT: boolean, data: any = undefined): Promise<T> {
    const headers = this.getHeaders(needsJWT);
    partURL = (partURL.indexOf('/') === 0) ? partURL.substr(1) : partURL;
    const options: any = {
      responseType: 'json',
      headers,
      body: data
    };

    if (!data) {
      delete options.body;
    }
    return firstValueFrom(this.http.delete(`${this.apiURL}/${partURL}`, options) as any);
  }

  private getHeaders(needsJWT: boolean) {
    let headers: {
      Authorization?: string;
      'X-App-token': string;
    } = {
      'X-App-token': this.appToken
    };

    if (needsJWT) {
      headers = {
        ...headers,
        Authorization: `Bearer ${this._webToken}`
      }
    }

    return headers;
  }
}
