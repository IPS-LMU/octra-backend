import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {OctraAPIService} from '@octra/ngx-octra-api';

@Component({
  selector: 'ocb-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  styleUrls: ['./user-dropdown.component.css']
})
export class UserDropdownComponent implements OnInit {
  users: any [] = [];
  @Input() label = 'Select User';
  selectedUserID = null;
  @Output() selectionChange: EventEmitter<any> = new EventEmitter<any>();
  private usersRetrieved: EventEmitter<any[]>;
  private usersLoaded = false;

  constructor(private api: OctraAPIService) {
    this.usersRetrieved = new EventEmitter<any[]>();
    this.api.listAccounts().then((users) => {
      this.users = users;
      this.usersLoaded = true;
      this.usersRetrieved.emit(users);
    }).catch((error) => {
      console.error(error);
      this.usersLoaded = true;
      this.usersRetrieved.emit(this.users);
    });
  }

  ngOnInit(): void {
  }

  selectUser(user: any) {
    this.selectedUserID = user.id;
    this.selectionChange.emit(user);
  }

  public selectUserById(id: number) {
    const subscr = this.usersRetrieved.subscribe((users) => {
      const user = users.find(a => a.id === id);
      if (user) {
        this.selectUser(user);
      } else {
        console.error(`Can't set user to dropdown because not found.`);
      }
      subscr.unsubscribe();
    });
  }
}
