import {Component, OnInit} from '@angular/core';
import {BsModalRef, ModalOptions} from 'ngx-bootstrap/modal';

@Component({
  selector: 'ocb-success-modal',
  templateUrl: './success-modal.component.html',
  styleUrls: ['./success-modal.component.css']
})
export class SuccessModalComponent implements OnInit {
  title = '';
  message = '';

  public static options: ModalOptions = {
    ignoreBackdropClick: true
  };

  constructor(public bsModalRef: BsModalRef) {
  }

  ngOnInit(): void {
  }
}
