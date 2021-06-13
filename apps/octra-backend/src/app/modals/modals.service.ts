import {Injectable} from '@angular/core';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import {ErrorModalComponent} from './error/error-modal.component';
import {YesNoModalComponent} from './yes-no-modal/yes-no-modal.component';
import {SuccessModalComponent} from './success/success-modal.component';
import {ChoiceModalComponent} from './choice-modal/choice-modal.component';
import {ProjectConfigModalComponent} from './projectconfig-modal/project-config-modal.component';

@Injectable({
  providedIn: 'root'
})
export class ModalsService {
  bsModalRef: BsModalRef | undefined;

  constructor(private modalService: BsModalService) {
  }

  public openSuccessModal(title: string, message: string): Promise<void> {
    return new Promise<void>((resolve) => {
      this.bsModalRef = this.modalService.show(SuccessModalComponent, SuccessModalComponent.options);
      this.bsModalRef.content.title = title;
      this.bsModalRef.content.message = message;
      const subscr = this.bsModalRef.onHidden.subscribe(() => {
        resolve();
        subscr.unsubscribe();
      });
    });
  }

  public openErrorModal(title: string, message: string) {
    this.bsModalRef = this.modalService.show(ErrorModalComponent, ErrorModalComponent.options);
    this.bsModalRef.content.title = title;
    this.bsModalRef.content.message = message;
  }

  public openYesNoModal(title: string, message: string, yesCallback: () => void, noCallback: () => void) {
    this.bsModalRef = this.modalService.show(YesNoModalComponent, YesNoModalComponent.options);
    this.bsModalRef.content.title = title;
    this.bsModalRef.content.message = message;
    this.bsModalRef.content.yesCallback = yesCallback;
    this.bsModalRef.content.noCallback = noCallback;
  }

  public openChoiceModal(title: string, message: string, choices: {
    label: string;
    value: string;
    class: string;
  }[], callback: (choosedValue: string) => void) {
    this.bsModalRef = this.modalService.show(ChoiceModalComponent, ChoiceModalComponent.options);
    this.bsModalRef.content.title = title;
    this.bsModalRef.content.message = message;
    this.bsModalRef.content.callback = callback;
    this.bsModalRef.content.choices = choices;
  }


  public openProjectConfigModal(projectConfig: any, guidelines: any[]): Promise<{
    status: string;
    projectConfig?: any;
    guidelines?: any[];
  }> {
    return new Promise<{
      status: string;
      projectConfig?: any;
      guidelines?: any[];
    }>((resolve) => {
      const jsonString = (projectConfig) ? JSON.stringify(projectConfig, null, '\t') : '';

      this.bsModalRef = this.modalService.show(ProjectConfigModalComponent, ProjectConfigModalComponent.options);
      this.bsModalRef.content.projectConfig = {
        isValid: false,
        json: jsonString
      };
      let guidelinesValid = true;
      this.bsModalRef.content.guidelines = guidelines.map(a => {
        try {
          return {
            language: a.language,
            json: JSON.stringify(a.json, null, '\t')
          }
        } catch (e) {
          guidelinesValid = false;
          return {
            language: a.language,
            json: ''
          };
        }
      });

      if (!guidelinesValid) {
        this.openErrorModal('Guidelines Error', 'Reading guidelines failed');
      }

      this.bsModalRef.content.saveCallback = (newProjectConfig: any, newGuidelines: any) => {
        resolve({
          status: 'changed',
          projectConfig: newProjectConfig,
          guidelines: newGuidelines
        });
      };
      this.bsModalRef.content.closeCallback = () => {
        resolve({
          status: 'aborted'
        });
      };
    });
  }
}
