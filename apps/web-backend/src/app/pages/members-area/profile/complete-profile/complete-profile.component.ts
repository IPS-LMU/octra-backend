import {Component, OnDestroy, OnInit} from '@angular/core';
import {SubscriptionManager} from '@octra/utilities';
import {AppStorageService} from '../../../../app-storage.service';
import {AccountFieldDefinitionDto} from '@octra/api-types';
import {OctraAPIService} from '@octra/ngx-octra-api';

@Component({
  selector: 'web-backend-complete-profile',
  templateUrl: './complete-profile.component.html',
  styleUrls: ['./complete-profile.component.scss'],
})
export class CompleteProfileComponent implements OnInit, OnDestroy {
  private subscription = new SubscriptionManager();

  public definition?: AccountFieldDefinitionDto;

  public accountFields: AccountFieldDefinitionDto[] = [];

  constructor(public appStorage: AppStorageService, private api: OctraAPIService) {
    this.api.listAccountFields().then((fields) => {
      this.accountFields = fields;
      this.definition = fields[0];
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.subscription.destroy();
  }
}
