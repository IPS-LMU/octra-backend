import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {
  AnnotationStartResponseDataItem,
  AppTokenChangeResponseDataItem,
  AppTokenRefreshResponseDataItem,
  AppTokenResponseDataItem,
  CreateGuidelinesRequest,
  CreateProjectRequest,
  GuidelinesSaveResponseDataItem,
  MediaUploadResponse,
  ProjectResponseDataItem,
  ProjectTranscriptsGetResponseDataItem,
  SaveAnnotationRequest,
  TranscriptGetResponseDataItem,
  UserInfoResponseDataItem,
  UserLoginResponse
} from '@octra/db';

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

  /***
   * does the login process.
   * @param type
   * @param name
   * @param password
   */
  public loginUser = (type: 'local' | 'shibboleth', name?: string, password?: string): Promise<UserLoginResponse> => {
    console.log(`LOGIN TEST`);
    return new Promise<UserLoginResponse>((resolve, reject) => {
      this.http.post(`${this.apiURL}/users/login`, {
        type, name, password
      }, {
        headers: this.getHeaders(false)
      }).toPromise<any>().then((result) => {
        this._authenticated = result.authenticated;
        if (result.authenticated) {
          this._webToken = result.token;
          resolve(result);
        } else if (result.data.openURL && result.data.openURL.trim() !== '') {
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
  public retrieveTokenFromWindow(windowURL: string): Promise<string> {
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
  public listAppTokens(): Promise<AppTokenResponseDataItem[]> {
    return this.get('/app/tokens', true);
  }

  public getTranscript(transcriptID: number): Promise<TranscriptGetResponseDataItem[]> {
    return this.get(`${this.apiURL}/transcripts/${transcriptID}`, true);
  }

  public getProjectTranscripts(projectName: string): Promise<ProjectTranscriptsGetResponseDataItem[]> {
    return this.get(`/projects/transcripts/?projectName=${projectName}`, true);
  }

  public removeAppToken(id: number): Promise<void> {
    return this.delete<any>(`/app/tokens/${id}`, true);
  }

  public getProject(id: number): Promise<ProjectResponseDataItem> {
    return this.get(`/projects/${id}`, true);
  }

  public getGuidelines(id: number): Promise<GuidelinesSaveResponseDataItem[]> {
    return this.get(`/projects/${id}/guidelines`, true);
  }

  public listUsers(): Promise<UserInfoResponseDataItem[]> {
    return this.get('/account/', true);
  }

  public listProjects(): Promise<ProjectResponseDataItem[]> {
    return this.get('/project/', true);
  }

  public createProject(projectData: CreateProjectRequest): Promise<ProjectResponseDataItem> {
    return this.post(`/projects`, projectData, true);
  }

  public saveGuidelines(projectID: number, requestData: CreateGuidelinesRequest[]): Promise<void> {
    return this.put(`/projects/${projectID}/guidelines`, requestData, true);
  }

  public removeProject(id: number, reqData: any): Promise<void> {
    let options = '';
    if (reqData.cutAllReferences) {
      options = '?cutAllReferences=true';
    } else if (reqData.removeAllReferences) {
      options = '?removeAllReferences=true';
    }

    return this.delete(`/projects/${id}/${options}`, true);
  }

  public changeMyPassword(oldPassword: string, password: string): Promise<void> {
    return this.put('/account/password', {
      oldPassword,
      password
    }, true);
  }

  public getCurrentUserInformation(): Promise<UserInfoResponseDataItem> {
    return this.get('/account/current', true);
  }

  public changeProject(id: number, requestData: CreateProjectRequest): Promise<void> {
    return this.put(`/projects/${id}`, requestData, true);
  }

  public createAppToken(tokenData: AppTokenResponseDataItem): Promise<boolean> {
    return this.post<any>(`/app/tokens`, tokenData, true);
  }

  public changeAppToken(id: number, tokenData: AppTokenResponseDataItem): Promise<AppTokenChangeResponseDataItem> {
    return this.put(`/app/tokens/${id}`, tokenData, true);
  }

  public refreshAppToken(id: number): Promise<AppTokenRefreshResponseDataItem> {
    return this.put(`/app/tokens/${id}/refresh`, {}, true);
  }

  public startAnnotation(projectID: number): Promise<AnnotationStartResponseDataItem> {
    return this.post(`/projects/${projectID}/annotations/start`, {}, true);
  }

  public freeAnnotation(projectID: number, annotationID: number): Promise<AnnotationStartResponseDataItem> {
    return this.post(`/projects/${projectID}/annotations/${annotationID}/free`, {}, true);
  }

  public saveAnnotation(projectID: number, annotationID: number, data: SaveAnnotationRequest): Promise<AnnotationStartResponseDataItem> {
    return this.post(`/projects/${projectID}/annotations/${annotationID}/save`, data, true);
  }

  public deliverMediaForTranscription(projectID: number, file: File, data: any): Promise<MediaUploadResponse> {
    return this.post(`/media/`, data, true);
  }

  public uploadMediaForTranscription(file: File, data: any): Promise<MediaUploadResponse> {
    const formData = new FormData();
    formData.append('media', file);
    data = (!(typeof data === 'string')) ? JSON.stringify(data) : data;
    formData.append('data', new File([data], 'data.json', {type: 'application/json'}));
    return this.post(`delivery/media/upload`, formData, true);
  }

  public uploadMediaItem(file: File): Promise<MediaUploadResponse> {
    const formData = new FormData();
    // TODO we need a projectID?
    // TODO do we need transcript?
    // TODO or do we rename it to just "uploadFile?" => /files/upload?
    formData.append('media', file);
    return this.post(`media/upload`, formData, true);
  }

  private get<T>(partURL: string, needsJWT: boolean): Promise<T> {
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

  private post<T>(partURL: string, data: any, needsJWT: boolean): Promise<T> {
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

  private put<T>(partURL: string, data: any, needsJWT: boolean): Promise<T> {
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

  private delete<T>(partURL: string, needsJWT: boolean): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const headers = this.getHeaders(needsJWT);
      partURL = (partURL.indexOf('/') === 0) ? partURL.substr(1) : partURL;

      const subscription = this.http.delete(`${this.apiURL}/${partURL}`, {
        responseType: 'json',
        headers
      }).subscribe((result: any) => {
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
