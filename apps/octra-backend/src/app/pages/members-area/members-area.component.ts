import {Component, OnInit} from '@angular/core';
import {APIService} from '../../api.service';

@Component({
  selector: 'ocb-members-area',
  templateUrl: './members-area.component.html',
  styleUrls: ['./members-area.component.css']
})
export class MembersAreaComponent implements OnInit {

  constructor(public api: APIService) {
  }

  ngOnInit(): void {
  }

}
