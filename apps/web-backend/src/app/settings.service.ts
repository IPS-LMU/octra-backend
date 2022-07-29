import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AppSettings} from './obj/settings.interface';
import {OctraAPIService} from '@octra/ngx-octra-api';
import {firstValueFrom} from 'rxjs';
import {SessionStorage} from 'ngx-webstorage';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  set webToken(value: string | undefined) {
    this._webToken = value;
    this.api.webToken = value;
  }

  get settingsLoaded(): EventEmitter<boolean> {
    setTimeout(() => {
      if (this._settings !== undefined) {
        this._settingsLoaded.emit(true);
      }
    }, 200);
    return this._settingsLoaded;
  }

  private _settings: AppSettings | undefined = undefined;

  get settings(): AppSettings | undefined {
    return this._settings;
  }

  private _settingsLoaded: EventEmitter<boolean> = new EventEmitter<boolean>();
  private _apiLoaded: EventEmitter<void> = new EventEmitter();

  @SessionStorage() private _webToken?: string;

  constructor(private http: HttpClient, private api: OctraAPIService) {
    this.http.get('./config/config.json', {
      responseType: 'json'
    }).subscribe((response: any) => {
        this._settings = response as AppSettings;
        this._settingsLoaded.emit(true);
        this.api.init(this._settings.api.url, this._settings.api.token, this._webToken, environment.production);
        this._apiLoaded.emit();
      },
      (e) => {
        alert('Can not load config.json.');
        console.error(e);
      });
  }

  public async asSoonAsAPILoaded(): Promise<void> {
    if (this.api.initialized) {
      return;
    }
    return firstValueFrom(this._apiLoaded);
  }
}
