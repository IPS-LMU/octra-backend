import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ModalsService} from '../../modals/modals.service';
import {OctraAPIService} from '@octra/ngx-octra-api';
import {AppStorageService} from '../../app-storage.service';
import {AccountLoginMethod} from '@octra/api-types';
import {SettingsService} from '../../settings.service';

@Component({
  selector: 'ocb-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {

  public user = {
    name: '',
    password: ''
  };

  public get AccountLoginMethod() {
    return AccountLoginMethod;
  }

  windowChecker: number = -1;

  constructor(private settingsService: SettingsService, public api: OctraAPIService, private router: Router, private modalsService: ModalsService, public appStorage: AppStorageService, private route: ActivatedRoute) {
    this.settingsService.asSoonAsAPILoaded().then(() => {
      if (this.api.authType) {
        this.appStorage.autoLogin(this.api.authType);
      }
    });
  }

  ngOnInit(): void {
  }

  onSubmit(type: AccountLoginMethod) {
    const name = type === AccountLoginMethod.local ? this.user.name : undefined;
    const password = type === AccountLoginMethod.local ? this.user.password : undefined;

    this.appStorage.login(type, name, password).catch((error) => {
      this.modalsService.openErrorModal('Error occurred', error);
    });
  }
}
