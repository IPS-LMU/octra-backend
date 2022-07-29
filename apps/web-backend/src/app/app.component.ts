import {Component, OnDestroy} from '@angular/core';
import {SettingsService} from './settings.service';
import {AppStorageService} from './app-storage.service';

@Component({
  selector: 'ocb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  title = 'web-backend';

  constructor(private settingsService: SettingsService, private appStorage: AppStorageService) {
  }

  ngOnDestroy() {
    this.settingsService.destroy();
    this.appStorage.destroy();
  }
}
