import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AppSettings} from './obj/settings.interface';
import {OctraAPIService} from '@octra/ngx-octra-api';
import {firstValueFrom} from 'rxjs';
import {LocalStorage, SessionStorage} from 'ngx-webstorage';
import {environment} from '../environments/environment';
import {getBrowserLang, TranslocoService} from '@ngneat/transloco';
import {SubscriptionManager} from '@octra/utilities';

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
  @LocalStorage() private _language?: string;

  private subscrManager = new SubscriptionManager();

  constructor(private http: HttpClient, private api: OctraAPIService, private transloco: TranslocoService) {
    this.transloco.setActiveLang(this._language ?? getBrowserLang() ?? 'en');
    this.http.get('./config/config.json', {
      responseType: 'json'
    }).subscribe({
      next: (response: any) => {
        this._settings = response as AppSettings;
        this._settingsLoaded.emit(true);
        this.api.init(this._settings.api.url, this._settings.api.token, this._webToken, environment.production);
        this._apiLoaded.emit();
      },
      error: (e) => {
        alert('Can not load config.json.');
        console.error(e);
      }
    });

    this.subscrManager.add(
      this.transloco.langChanges$.subscribe({
        next: (lang) => {
          this._language = lang;
        }
      }))
  }

  public async asSoonAsAPILoaded(): Promise<void> {
    if (this.api.initialized) {
      return;
    }
    return firstValueFrom(this._apiLoaded);
  }

  public destroy() {
    this.subscrManager.destroy();
  }
}
