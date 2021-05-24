import {Component, OnInit} from '@angular/core';
import {BsLocaleService} from 'ngx-bootstrap/datepicker';
import {defineLocale, esLocale, frLocale, itLocale} from 'ngx-bootstrap/chronos';
import {deLocale} from 'ngx-bootstrap/locale';
import {APIService} from '../../../../api.service';
import {DateTime} from 'luxon';
import {ModalsService} from '../../../../modals/modals.service';
import {Router} from '@angular/router';

@Component({
  selector: 'ocb-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.css']
})
export class AddProjectComponent implements OnInit {
  isEditPage = false;
  formData = {
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

  constructor(private localeService: BsLocaleService, private api: APIService,
              private modalService: ModalsService, private router: Router) {
    defineLocale('de', deLocale);
    defineLocale('fr', frLocale);
    defineLocale('es', esLocale);
    defineLocale('it', itLocale);
  }

  ngOnInit(): void {
    const locale = window.navigator.language.replace(/([^\-]+).*/g, '$1');
    this.localeService.use(locale);
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
  }

  userSelectionChanged(user: any) {
    if (user) {
      this.formData.admin_id = user.id;
      this.adminSelectionLabel = `Selected: ${user.username}`;
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

}
