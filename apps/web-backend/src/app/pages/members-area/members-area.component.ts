import {Component, OnInit} from '@angular/core';
import {AppStorageService} from '../../app-storage.service';

@Component({
  selector: 'ocb-members-area',
  templateUrl: './members-area.component.html',
  styleUrls: ['./members-area.component.css']
})
export class MembersAreaComponent implements OnInit {

  constructor(public appStorage: AppStorageService) {
  }

  ngOnInit(): void {
  }

}
