import {Component, OnDestroy, OnInit} from '@angular/core';
import {APIService} from '../../../api.service';
import {ModalsService} from '../../../modals/modals.service';

@Component({
  selector: 'ocb-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  oldPassword = '';
  newPassword = '';
  newPasswordRepeat = '';

  get allSet(): boolean {
    return this.oldPassword.trim() !== '' && this.newPassword.trim() !== '' && this.newPasswordRepeat.trim() !== '';
  }

  constructor(public api: APIService, private modalsService: ModalsService) {
  }

  ngOnInit(): void {
  }

  onChangeClick() {
    if (this.newPassword === this.newPasswordRepeat) {
      this.api.changePassword(this.oldPassword, this.newPassword).then((response) => {
        if (response.status) {
          if (response.status === 'success') {
            this.modalsService.openSuccessModal('Password changed', 'Password was changed. You will now be signed out.').then(() => {
              this.api.logout();
            }).catch((error) => {
              console.error(error);
            });
          } else {
            this.modalsService.openErrorModal('Error occurred', response.message);
          }
        } else {
          this.modalsService.openErrorModal('Error occurred', 'Invalid result');
        }
      }).catch((error) => {
        console.error(error);
        this.modalsService.openErrorModal('Error occurred', error);
      });
    } else {
      this.modalsService.openErrorModal('Error occurred',
        'The repeated password is not the same as the new password. Please type in again');
    }
  }

  clearPasswords() {
    this.oldPassword = '';
    this.newPassword = '';
    this.newPasswordRepeat = '';
  }

  ngOnDestroy() {
    this.clearPasswords();
  }
}

