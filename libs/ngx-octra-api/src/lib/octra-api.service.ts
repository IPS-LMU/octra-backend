import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {
  AccountDto,
  AccountLoginMethod,
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

  public async login(type: AccountLoginMethod, name?: string, password?: string) {
    console.log(`LOGIN TEST`);
    return new Promise<AuthDto>((resolve, reject) => {
      firstValueFrom(this.http.post(`${this.apiURL}/users/login`, {
        type, name, password
      }, {
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

  public async getTask(projectID: number, taskID: number): Promise<TaskDto> {
    return this.get(`/projects/${projectID}/tasks/${taskID}`, true);
  }

  public async listTasks(projectID: number): Promise<TaskDto[]> {
    return this.get(`/projects/${projectID}/tasks/`, true);
  }

  public async removeAppToken(id: number): Promise<void> {
    return this.delete(`/app/tokens/${id}`, true);
  }

  public async getProject(id: number): Promise<ProjectDto> {
    return this.get(`/projects/${id}`, true);
  }

  public async getGuidelines(id: number): Promise<GuidelinesDto[]> {
    return this.get(`/projects/${id}/guidelines`, true);
  }

  public async listAccounts(): Promise<AccountDto[]> {
    return this.get('/account/', true);
  }

  public async listProjects(): Promise<ProjectDto[]> {
    return this.get('/projects/', true);
  }

  public async createProject(projectData: ProjectRequestDto): Promise<ProjectRequestDto> {
    return this.post(`/projects`, projectData, true);
  }

  public async saveGuidelines(projectID: number, requestData: GuidelinesDto[]): Promise<void> {
    return this.put(`/projects/${projectID}/guidelines`, requestData, true);
  }

  public async removeProject(id: number, reqData: {
    cutAllReferences: boolean;
    removeAllReferences: boolean;
    removeProjectFiles: boolean;
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

  public async changeProject(id: number, requestData: ProjectRequestDto): Promise<void> {
    return this.put(`/projects/${id}`, requestData, true);
  }

  public async createAppToken(tokenData: AppTokenDto): Promise<boolean> {
    return this.post<any>(`/app/tokens`, tokenData, true);
  }

  public async changeAppToken(id: number, tokenData: AppTokenDto): Promise<AppTokenDto> {
    return this.put(`/app/tokens/${id}`, tokenData, true);
  }

  public async refreshAppToken(id: number): Promise<AppTokenDto> {
    return this.put(`/app/tokens/${id}/refresh`, {}, true);
  }

  public async startAnnotation(projectID: number): Promise<any> { //TODO add missing annotation dto
    return this.post(`/projects/${projectID}/annotations/start`, {}, true);
  }

  public async freeAnnotation(projectID: number, annotationID: number): Promise<any> {
    return this.post(`/projects/${projectID}/annotations/${annotationID}/free`, {}, true);
  }

  public async saveAnnotation(projectID: number, annotationID: number, data: SaveAnnotationDto): Promise<TaskDto> {
    return this.post(`/projects/${projectID}/annotations/${annotationID}/save`, data, true);
  }

  public async deliverTaskData(projectID: number, file: File, data: TaskUploadDto): Promise<TaskDto> {
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
    return new Promise<T>((resolve, reject) => {
      const headers = this.getHeaders(needsJWT);
      partURL = (partURL.indexOf('/') === 0) ? partURL.substr(1) : partURL;

      const subscription = this.http.get(`${this.apiURL}/${partURL}`, {
        responseType: 'json',
        headers
      }).subscribe((result: any) => {
        subscription.unsubscribe();
        this.checkResult(result, resolve, reject);
      }, (error) => {
        reject((error.error?.message) ? error.error.message : error.message);
      })
    });
  }

  private async post<T>(partURL: string, data: any, needsJWT: boolean): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const headers = this.getHeaders(needsJWT);
      partURL = (partURL.indexOf('/') === 0) ? partURL.substr(1) : partURL;

      const subscription = this.http.post(`${this.apiURL}/${partURL}`, data, {
        responseType: 'json',
        headers
      }).subscribe((result: any) => {
        subscription.unsubscribe();
        this.checkResult(result, resolve, reject);
      }, (error) => {
        reject((error.error?.message) ? error.error.message : error.message);
      })
    });
  }

  private async put<T>(partURL: string, data: any, needsJWT: boolean): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const headers = this.getHeaders(needsJWT);
      partURL = (partURL.indexOf('/') === 0) ? partURL.substr(1) : partURL;

      const subscription = this.http.put(`${this.apiURL}/${partURL}`, data, {
        responseType: 'json',
        headers
      }).subscribe((result: any) => {
        subscription.unsubscribe();
        this.checkResult(result, resolve, reject);
      }, (error) => {
        reject((error.error?.message) ? error.error.message : error.message);
      })
    });
  }

  private async delete<T>(partURL: string, needsJWT: boolean, data: any = undefined): Promise<T> {
    return new Promise<T>((resolve, reject) => {
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

      const subscription = this.http.delete(`${this.apiURL}/${partURL}`, options).subscribe((result: any) => {
        subscription.unsubscribe();
        this.checkResult(result, resolve, reject);
      }, (error) => {
        reject((error.error?.message) ? error.error.message : error.message);
      });
    });
  }

  private checkResult<T>(result: any, resolve: (result: T) => void, reject: (error: Error | string) => void) {
    if (result.status === 'success') {
      resolve(result.data as T);
    } else {
      reject(new Error(result.message));
    }
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
