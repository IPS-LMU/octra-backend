import {Component, OnDestroy, OnInit} from '@angular/core';
import {APIService} from '../../../api.service';

@Component({
  selector: 'ocb-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {

  constructor(public api: APIService) {
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
  }
}

