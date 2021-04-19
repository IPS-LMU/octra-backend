import {Component, OnInit} from '@angular/core';
import {BsModalRef, ModalOptions} from 'ngx-bootstrap/modal';

@Component({
  selector: 'ocb-error',
  templateUrl: './yes-no-modal.component.html',
  styleUrls: ['./yes-no-modal.component.css']
})
export class YesNoModalComponent implements OnInit {

  constructor(public bsModalRef: BsModalRef) {
  }

  public static options: ModalOptions = {
    ignoreBackdropClick: true
  };

  title: string;
  message: string;
  yesCallback: () => void;
  noCallback: () => void;

  ngOnInit(): void {
  }
}
