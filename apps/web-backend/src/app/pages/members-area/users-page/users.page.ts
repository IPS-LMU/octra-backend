import {Component, OnInit} from '@angular/core';
import {OctraAPIService} from '@octra/ngx-octra-api';
import {AccountDto} from '@octra/api-types';

@Component({
  selector: 'ocb-account',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.css']
})
export class UsersPage implements OnInit {
  public users: AccountDto[];

  constructor(private api: OctraAPIService) {
    this.users = [];
  }

  ngOnInit(): void {
    this.api.listAccounts().then((result) => {
      console.log(`result`);
      console.log(result);
      this.users = result;
    }).catch((error) => {
      console.error(error);
    });
  }

  getGlobalRole(user: AccountDto) {
    return user.generalRole;
  }
}
