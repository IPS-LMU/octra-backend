import {Component, OnInit} from '@angular/core';
import {OctraAPIService} from '@octra/ngx-octra-api';
import {UserInfoResponseDataItem, UserRoleScope} from '@octra/db';

@Component({
  selector: 'ocb-account',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.css']
})
export class UsersPage implements OnInit {
  public users: UserInfoResponseDataItem[];

  constructor(private api: OctraAPIService) {
    this.users = [];
  }

  ngOnInit(): void {
    this.api.listUsers().then((result) => {
      console.log(`result`);
      console.log(result);
      this.users = result;
    }).catch((error) => {
      console.error(error);
    });
  }

  getGlobalRole(user: UserInfoResponseDataItem) {
    return user.accessRights.find(a => a.scope === UserRoleScope.general)?.role;
  }
}
