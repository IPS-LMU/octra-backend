import {Component, OnInit} from '@angular/core';
import {BsModalRef, ModalOptions} from 'ngx-bootstrap/modal';

@Component({
  selector: 'ocb-error-modal',
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.css']
})
export class ErrorModalComponent implements OnInit {
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
