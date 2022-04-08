import {Component, OnInit} from '@angular/core';
import {ModalsService} from '../../../modals/modals.service';
import {SettingsService} from '../../../settings.service';
import {Router} from '@angular/router';
import {OctraAPIService} from '@octra/ngx-octra-api';

@Component({
  selector: 'ocb-app-token',
  templateUrl: './apptokens.component.html',
  styleUrls: ['./apptokens.component.css']
})
export class ApptokensComponent implements OnInit {

  public apptokens: any[] = [];

  constructor(public api: OctraAPIService, private modalService: ModalsService, public settingsService: SettingsService, private router: Router
  ) {
  }

  ngOnInit(): void {
    this.updateAppTokens();
  }

  updateAppTokens() {
    this.api.listAppTokens().then((rows) => {
        this.apptokens = rows;
      }
    ).catch((error) => {
      console.error(error);
    });
  }

  onAppTokenEdit(id: number) {
    this.router.navigate(['members/apptokens/add'], {
      queryParams: {
        edit: id
      }
    });
  }

  onAppTokenRefresh(id: number) {
    const apptokenData = this.apptokens.find(a => a.id === id);
    this.modalService.openYesNoModal('Refresh app token', `Are you sure to overwrite the old app token for '${apptokenData.name}' with a new one?`, () => {
      this.api.refreshAppToken(id).then(() => {
        this.updateAppTokens();
      }).catch((error) => {
        this.modalService.openErrorModal('Error occured', error);
      });
    }, () => {
    });
  }

  onAppTokenRemove(id: number) {
    this.modalService.openYesNoModal('Remove app token', 'Are you sure to remove the app token permanently?', () => {
      this.api.removeAppToken(id).then(() => {
        this.updateAppTokens();
      }).catch((error) => {
        this.modalService.openErrorModal('Error occured', error);
      });
    }, () => {
    });
  }

  checkEqualAppToken(apptoken: string) {
    if (this.settingsService.settings) {
      return apptoken === this.settingsService.settings.api.token;
    }
    return false;
  }
}
