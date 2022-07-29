import {Component, OnInit} from '@angular/core';
import {AppStorageService} from '../../app-storage.service';
import {TranslocoService} from '@ngneat/transloco';

@Component({
  selector: 'ocb-members-area',
  templateUrl: './members-area.component.html',
  styleUrls: ['./members-area.component.css']
})
export class MembersAreaComponent implements OnInit {
  public navbarCollapsed = true;

  public get availableLangs() {
    return this.transloco.getAvailableLangs() as string[];
  }

  constructor(public appStorage: AppStorageService, public transloco: TranslocoService) {
  }

  ngOnInit(): void {
  }

}
