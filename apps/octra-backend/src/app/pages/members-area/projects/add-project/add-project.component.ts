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
    configuration: '',
    startdate: '',
    enddate: '',
    active: true,
    admin_id: null
  };

  adminSelectionLabel = 'Select project administrator';
  projectSchedule: {
    start: Date,
    end: Date
  } = {
    start: new Date(),
    end: new Date()
  }

  @ViewChild('userDropdown') userDropdown: UserDropdownComponent;

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
        this.api.getProject(this.editingID).then((result) => {
          this.formData = result;
          this.projectSchedule.start = (this.formData.startdate) ?
            DateTime.fromISO(this.formData.startdate).toJSDate() : undefined;
          this.projectSchedule.end = (this.formData.enddate)
            ? DateTime.fromISO(this.formData.enddate).toJSDate() : undefined;
          if (this.formData.admin_id && this.formData.admin_id > -1) {
            this.userDropdown.selectUserById(this.formData.admin_id);
          }
          this.isEditPage = true;
        }).catch(() => {
          this.modalService.openErrorModal('Error occured', 'Can not find project.');
        });
      }
    });
  }

  onSubmit() {
    this.formData.startdate = DateTime.fromJSDate(this.projectSchedule.start).toJSON();
    this.formData.enddate = DateTime.fromJSDate(this.projectSchedule.end).toJSON();
    if (this.formData.startdate === null) {
      delete this.formData.startdate;
    }
    if (this.formData.enddate === null) {
      delete this.formData.enddate;
    }
    this.formData.admin_id = (this.formData.admin_id === null) ? undefined : this.formData.admin_id;

    if (!this.isEditPage) {
      this.api.createProject(this.formData).then((success) => {
        if (success) {
          this.modalService.openSuccessModal('Project created', 'The project was created successfully').then(() => {
            this.router.navigate(['members/projects']);
          });
        }
      }).catch((error) => {
        console.error(error);
        this.modalService.openErrorModal('Project not created', 'Project could not be created.');
      });
    } else {
      this.api.changeProject(this.editingID, this.formData).then((success) => {
        if (success) {
          this.modalService.openSuccessModal('Project changed', 'The project was changed successfully').then(() => {
            this.router.navigate(['members/projects']);
          });
        }
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
      this.formData.admin_id = null;
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
    this.modalService.openProjectConfigModal(this.formData.configuration).then((event) => {
      if (event.status === 'changed') {
        try {
          const json = JSON.parse(event.projectConfig);
          this.formData.configuration = JSON.stringify(json);
        } catch (e) {
          console.error(e);
        }
      }
    });
  }

}
