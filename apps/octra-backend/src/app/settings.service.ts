import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AppSettings} from './obj/settings.interface';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
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

  private _settingsLoaded: EventEmitter<boolean>;

  constructor(private http: HttpClient) {
    this._settingsLoaded = new EventEmitter<boolean>();
    this.http.get('./config/config.json', {
      responseType: 'json'
    }).subscribe((response: any) => {
        this._settings = response as AppSettings;
        this._settingsLoaded.emit(true);
      },
      (e) => {
        alert('Can not load config.json.');
        console.error(e);
      });
  }
}
