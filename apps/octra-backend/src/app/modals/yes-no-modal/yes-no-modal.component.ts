import {Component, OnInit} from '@angular/core';
import {BsModalRef, ModalOptions} from 'ngx-bootstrap/modal';

@Component({
  selector: 'ocb-yes-no-modal',
  templateUrl: './yes-no-modal.component.html',
  styleUrls: ['./yes-no-modal.component.css']
})
export class YesNoModalComponent implements OnInit {

  constructor(public bsModalRef: BsModalRef) {
  }

  public static options: ModalOptions = {
    ignoreBackdropClick: true
  };

  title = '';
  message = '';
  yesCallback: () => void = () => {
  };
  noCallback: () => void = () => {
  };

  ngOnInit(): void {
  }
}
