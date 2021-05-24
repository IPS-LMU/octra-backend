import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {APIService} from '../../api.service';

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

  constructor(private api: APIService) {
    this.api.retrieveUsers().then((users) => {
      this.users = users;
    }).catch((error) => {
      console.error(error);
    });
  }

  ngOnInit(): void {
  }

  selectUser(user: any) {
    this.selectedUserID = user.id;
    this.selectionChange.emit(user);
  }

}
