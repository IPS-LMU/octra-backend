import {Component, OnInit} from '@angular/core';
import {BsModalRef, ModalOptions} from 'ngx-bootstrap/modal';

@Component({
  selector: 'ocb-choice-modal',
  templateUrl: './choice-modal.component.html',
  styleUrls: ['./choice-modal.component.css']
})
export class ChoiceModalComponent implements OnInit {

  constructor(public bsModalRef: BsModalRef) {
  }

  public static options: ModalOptions = {
    ignoreBackdropClick: true,
    class: 'modal-lg'
  };

  title = '';
  message = '';
  callback: (choiceValue: string) => void = () => {
  };
  choices: {
    label: string;
    value: string;
    class: string;
  }[] = [];

  ngOnInit(): void {
  }
}
