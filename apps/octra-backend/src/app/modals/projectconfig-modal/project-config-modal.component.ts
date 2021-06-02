import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {BsModalRef, ModalOptions} from 'ngx-bootstrap/modal';
import {CodeJar} from 'codejar';
import * as Prism from 'prismjs';
import 'prismjs/components/prism-json';

@Component({
  selector: 'ocb-project-config-modal',
  templateUrl: './project-config-modal.component.html',
  styleUrls: ['./project-config-modal.component.css']
})
export class ProjectConfigModalComponent implements OnInit, AfterViewInit {
  get projectConfig(): string {
    return this._projectConfig;
  }

  set projectConfig(value: string) {
    this._projectConfig = value;
    this.checkConfig(this._projectConfig);
    this.codeJar.updateCode(this._projectConfig);
  }

  constructor(public bsModalRef: BsModalRef) {

  }

  public static options: ModalOptions = {
    ignoreBackdropClick: true,
    class: 'modal-xl'
  };

  codeJar: CodeJar;
  @ViewChild('editor') editor: ElementRef;
  private _projectConfig = '';

  saveCallback: (json) => void;
  closeCallback: () => void;

  public isValid = false;
  private lastCheck = 0;
  private lastUpdate = 0;
  public isChecking = false;

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    const highlightMethod = (editor: HTMLElement) => {
      // Do something with code and set html.
      editor.innerHTML = Prism.highlight(editor.textContent, Prism.languages.json, 'json');
    };
    this.codeJar = CodeJar(this.editor.nativeElement, highlightMethod, {tab: '\t'});
    this.codeJar.onUpdate((newCode) => {
      this._projectConfig = newCode;
      this.checkConfig(newCode);
    });
  }

  checkConfig(json) {
    setTimeout(() => {
      const now = Date.now();
      if (!this.isChecking && now - this.lastCheck > 400 && now - this.lastUpdate > 400) {
        this.isChecking = true;
        try {
          JSON.parse(json);
          this.isValid = true;
        } catch (e) {
          this.isValid = false;
        }
        this.lastCheck = Date.now();
        this.isChecking = false;
      }
    }, 450);

    this.lastUpdate = Date.now();
  }
}
