import {Component, OnInit} from '@angular/core';
import {ModalsService} from '../../../../modals/modals.service';
import {ActivatedRoute, Router} from '@angular/router';
import {OctraAPIService} from '@octra/ngx-octra-api';
import {AppTokenResponseDataItem} from '@octra/db';

@Component({
  selector: 'ocb-add-app-token',
  templateUrl: './add-app-token.component.html',
  styleUrls: ['./add-app-token.component.css']
})
export class AddAppTokenComponent implements OnInit {
  formData: AppTokenResponseDataItem = {
    id: 0, key: '', // ignored
    name: '',
    description: '',
    domain: '',
    registrations: false
  };

  isEditPage = false;
  editingID = -1;

  constructor(private api: OctraAPIService, private modalService: ModalsService, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params.edit) {
        this.api.retrieveAppTokenList().then((appTokens) => {
          console.log(appTokens);
          this.editingID = Number(params.edit);
          const appToken = appTokens.find(a => a.id === this.editingID);
          console.log(appToken);

          if (appToken) {
            this.formData = appToken;
            this.isEditPage = true;
            this.editingID = Number(params.edit);
          } else {
            this.modalService.openErrorModal('Error occured', 'Can not find app token.');
          }
        }).catch(() => {
          this.modalService.openErrorModal('Can not retrieve App tokens', 'Retrieving app tokens failed');
        });
      }
    });
  }

  onSubmit() {
    if (!this.isEditPage) {
      this.api.createAppToken(this.formData).then(() => {
        this.modalService.openSuccessModal('Apptoken created', 'The app token was created successfully').then(() => {
          this.router.navigate(['members/apptokens']);
        });
      }).catch((error) => {
        console.error(error);
        this.modalService.openErrorModal('Error occurred', 'App token could not be created.');
      });
    } else {
      this.api.changeAppToken(this.editingID, this.formData).then(() => {
        this.modalService.openSuccessModal('Apptoken changed', 'The app token was changed successfully').then(() => {
          this.router.navigate(['members/apptokens']);
        });
      }).catch((error) => {
        console.error(error);
        this.modalService.openErrorModal('Error occurred', 'App token could not be changed.');
      });
    }
  }
}
