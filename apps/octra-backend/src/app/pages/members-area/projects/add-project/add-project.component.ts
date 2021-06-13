import {Component, OnInit, ViewChild} from '@angular/core';
import {BsLocaleService} from 'ngx-bootstrap/datepicker';
import {defineLocale, esLocale, frLocale, itLocale} from 'ngx-bootstrap/chronos';
import {deLocale} from 'ngx-bootstrap/locale';
import {APIService} from '../../../../api.service';
import {DateTime} from 'luxon';
import {ModalsService} from '../../../../modals/modals.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CreateProjectRequest} from '@octra/db';
import {UserDropdownComponent} from '../../../../components/user-dropdown/user-dropdown.component';

@Component({
  selector: 'ocb-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.css']
})
export class AddProjectComponent implements OnInit {
  isEditPage = false;
  editingID = -1;
  formData: CreateProjectRequest = {
    name: '',
    shortname: '',
    description: '',
    configuration: null,
    startdate: '',
    enddate: '',
    active: true,
    admin_id: undefined
  };

  private guidelines: any[] = [];

  adminSelectionLabel = 'Select project administrator';
  projectSchedule: {
    start: Date,
    end: Date
  } = {
    start: new Date(),
    end: new Date()
  }

  @ViewChild('userDropdown') userDropdown: UserDropdownComponent | undefined;

  constructor(private localeService: BsLocaleService, private api: APIService,
              private modalService: ModalsService, private router: Router, private route: ActivatedRoute) {
    defineLocale('de', deLocale);
    defineLocale('fr', frLocale);
    defineLocale('es', esLocale);
    defineLocale('it', itLocale);
  }

  ngOnInit(): void {
    const locale = window.navigator.language.replace(/([^\-]+).*/g, '$1');
    this.localeService.use(locale);

    this.route.queryParams.subscribe((params) => {
      if (params.edit) {
        this.editingID = Number(params.edit);

        Promise.all([
          this.api.getProject(this.editingID),
          this.api.getGuidelines(this.editingID)
        ]).then(([project, guidelines]) => {
          // read project
          this.formData = project;
          this.isEditPage = true;
          this.projectSchedule.start = (this.formData.startdate) ?
            DateTime.fromISO(this.formData.startdate).toJSDate() : new Date();
          this.projectSchedule.end = (this.formData.enddate)
            ? DateTime.fromISO(this.formData.enddate).toJSDate() : new Date();
          if (this.formData.admin_id && this.formData.admin_id > -1) {
            if (this.userDropdown) {
              this.userDropdown.selectUserById(this.formData.admin_id);
            }
          }

          //read guidelines
          this.guidelines = guidelines;
        }).catch((error) => {
          console.error(error);
        });
        this.api.getProject(this.editingID).then((result) => {
        }).catch(() => {
          this.modalService.openErrorModal('Error occured', 'Can not find project.');
        });
      }
    });
  }

  onSubmit() {
    this.formData.startdate = (this.projectSchedule.start) ? DateTime.fromJSDate(this.projectSchedule.start).toJSON() : undefined;
    this.formData.enddate = (this.projectSchedule.end) ? DateTime.fromJSDate(this.projectSchedule.end).toJSON() : undefined;

    if (this.formData.startdate === null) {
      delete this.formData.startdate;
    }
    if (this.formData.enddate === null) {
      delete this.formData.enddate;
    }
    this.formData.admin_id = (this.formData.admin_id === null) ? undefined : this.formData.admin_id;

    if (!this.isEditPage) {
      this.api.createProject(this.formData).then((projectID: number) => {
        this.api.saveGuidelines(projectID, this.guidelines).then(() => {
          this.modalService.openSuccessModal('Project created', 'The project was created successfully').then(() => {
            this.router.navigate(['members/projects']);
          });
        }).catch((error) => {
          this.modalService.openErrorModal('Guidelines not saved', error);
          console.error(error);
        });
      }).catch((error) => {
        console.error(error);
        this.modalService.openErrorModal('Project not created', 'Project could not be created.');
      });
    } else {
      this.api.changeProject(this.editingID, this.formData).then(() => {
        this.api.saveGuidelines(this.editingID, this.guidelines).then(() => {
          this.modalService.openSuccessModal('Project changed', 'The project was changed successfully').then(() => {
            this.router.navigate(['members/projects']);
          });
        }).catch((error) => {
          this.modalService.openErrorModal('Guidelines not saved', error);
          console.error(error);
        });
      }).catch((error) => {
        console.error(error);
        this.modalService.openErrorModal('Project not changed', error);
      });
    }
  }

  userSelectionChanged(user: any) {
    if (user) {
      this.formData.admin_id = user.id;
      this.adminSelectionLabel = `Selected project administrator: ${user.username}`;
    } else {
      this.formData.admin_id = undefined;
      this.adminSelectionLabel = 'Select project administrator';
    }
  }

  onScheduleChange($event: Date, type: 'start' | 'end') {
    if (type === 'start') {
      this.projectSchedule.start = $event;
    } else {
      this.projectSchedule.end = $event;
    }
  }

  openProjectConfiguration() {
    console.log(`open`);
    console.log(this.guidelines);
    this.modalService.openProjectConfigModal(this.formData.configuration, this.guidelines).then((event) => {
      if (event.status === 'changed') {
        try {
          this.formData.configuration = JSON.parse(event.projectConfig.json);
          let guidelinesInvalid = false;

          if (event.guidelines) {
            this.guidelines = event.guidelines.map(a => {
              try {
                return {
                  language: a.language,
                  json: JSON.parse(a.json)
                };
              } catch (e) {
                guidelinesInvalid = true;
                return {
                  language: a.language,
                  json: {}
                };
              }
            });
          }
          console.log(`guidelines:`);
          console.log(this.guidelines);
        } catch (e) {
          console.error(e);
        }
      }
    });
  }

}
