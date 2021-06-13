import {AfterViewInit, Component, OnInit} from '@angular/core';
import {BsModalRef, ModalOptions} from 'ngx-bootstrap/modal';
import {DefaultProjectConfig} from '../../../json/projectconfig.sample';
import {DefaultGuidelinesConfig} from '../../../json/guidelines.sample';
import hljs from 'highlight.js';
import {CodeJarContainer} from 'ngx-codejar';
import {ModalsService} from '../modals.service';
import {TabsetComponent} from 'ngx-bootstrap/tabs';

@Component({
  selector: 'ocb-project-config-modal',
  templateUrl: './project-config-modal.component.html',
  styleUrls: ['./project-config-modal.component.css']
})
export class ProjectConfigModalComponent implements OnInit, AfterViewInit {

  constructor(public bsModalRef: BsModalRef, private modalService: ModalsService) {

  }

  public static options: ModalOptions = {
    ignoreBackdropClick: true,
    class: 'modal-xl'
  };

  areAllValid = false;
  public projectConfig = {
    isValid: false,
    json: ''
  };
  public guidelines: {
    language: string;
    json: string;
    isValid: boolean;
  }[] = [];

  private lastCheck = 0;
  private lastUpdate = 0;
  public isChecking = false;

  saveCallback: (json: {
    isValid: boolean;
    json: string;
  }, guidelines: {
    language: string;
    json: string;
    isValid: boolean;
  }[]) => void;
  closeCallback: () => void;

  selectedLanguage = '';

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.checkConfig(this.projectConfig.json, true).then((result) => {
      this.projectConfig.isValid = result;
      this.checkAllValid();
      this.checkAllGuidelines();
    }).catch((error) => {
      console.error(error);
    });
  }

  overwriteProjectConfigWithDefaults() {
    this.modalService.openYesNoModal('Overwrite with defaults?', `Do you really want to overwrite the project configuration? You can't redo this action.`, () => {
      this.projectConfig.json = JSON.stringify(DefaultProjectConfig, null, 2);
    }, () => {

    });
  }

  overwriteGuidelinesWithDefaults(index: number) {
    this.modalService.openYesNoModal('Overwrite with defaults?', `Do you really want to overwrite guidelines (${this.guidelines[index].language})? You can't redo this action.`, () => {
      this.guidelines[index].json = JSON.stringify(DefaultGuidelinesConfig, null, 2);
    }, () => {

    });
  }

  addGuidelines() {
    if (this.guidelines.findIndex(a => a.language === this.selectedLanguage) < 0) {
      this.guidelines.push({
        isValid: true,
        language: this.selectedLanguage,
        json: JSON.stringify(DefaultGuidelinesConfig, null, 2)
      });
    } else {
      this.modalService.openErrorModal('Language already exists', 'Guidelines for this language already exists.');
    }
    this.selectedLanguage = '';
  }

  highlightMethod(editor: CodeJarContainer) {
    if (editor.textContent !== null && editor.textContent !== undefined) {
      editor.innerHTML = hljs.highlight(editor.textContent, {
        language: 'json'
      }).value;
    }
  }

  checkConfig(json: string, force = false): Promise<boolean> {
    return new Promise<boolean>((resolve2) => {
      new Promise<void>((resolve) => {
        if (force) {
          resolve();
        } else {
          setTimeout(() => {
            resolve()
          }, 450);
        }
      }).then(() => {
        const now = Date.now();
        if (force || (!this.isChecking && now - this.lastCheck > 400 && now - this.lastUpdate > 400)) {
          this.isChecking = true;

          resolve2(this.isValidJSON(json));

          this.lastCheck = Date.now();
          this.isChecking = false;
        }
      });

      this.lastUpdate = Date.now();
    });
  }

  checkAllGuidelines() {
    const promises = [];

    for (const guideline of this.guidelines) {
      promises.push(this.checkConfig(guideline.json, true));
    }
    Promise.all(promises).then((results: boolean[]) => {
      for (let i = 0; i < results.length; i++) {
        this.guidelines[i].isValid = results[i];
      }
      this.checkAllValid();
    });
  }

  onGuidelineUpdated(code: string, i: number) {
    this.checkConfig(code).then((result) => {
      this.guidelines[i].isValid = result;
      this.checkAllValid();
    }).catch((error) => {
      console.error(error);
    });
  }

  onProjectConfigUpdated(code: string) {
    this.checkConfig(code).then((result) => {
      this.projectConfig.isValid = result;
      this.checkAllValid();
    }).catch((error) => {
      console.error(error);
    });
  }

  isValidJSON(json: string) {
    try {
      if (json !== '') {
        JSON.parse(json);
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  private checkAllValid() {
    this.areAllValid = this.projectConfig.isValid && this.guidelines.findIndex(a => !a.isValid) < 0;
  }

  removeGuidelines(index: number, tabset: TabsetComponent) {
    this.modalService.openYesNoModal('Delete guideline?', `Do you really want to delete guideline (${this.guidelines[index].language})? You can't redo this action.`, () => {
      this.guidelines.splice(index, 1);
      tabset.tabs[Math.max(0, index)].active = true;
    }, () => {

    });
  }
}
