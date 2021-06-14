import {Component, OnInit} from '@angular/core';
import {DateTime} from 'luxon';
import {ModalsService} from '../../../modals/modals.service';
import {Router} from '@angular/router';
import {OctraAPIService} from '@octra/ngx-octra-api';

@Component({
  selector: 'ocb-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  projects: any[] = [];
  users: any[] = [];

  constructor(private api: OctraAPIService, private modalService: ModalsService, private router: Router) {
  }

  ngOnInit(): void {
    this.updateProjects();
  }

  updateProjects() {
    this.api.listUsers().then((users) => {
      this.users = users;
      console.log(this.users);

      this.api.listProjects().then((projects) => {
        for (const project of projects) {
          if (project.startdate) {
            project.startdate = DateTime.fromISO(project.startdate).toLocaleString(DateTime.DATETIME_SHORT);
          }
          if (project.enddate) {
            project.enddate = DateTime.fromISO(project.enddate).toLocaleString(DateTime.DATETIME_SHORT);
          }
          if (project.admin_id) {
            console.log(`look for admin ${project.admin_id}`);
            const project_admin = this.users.find(a => a.id === project.admin_id);
            delete project.admin_id;
            (project as any).administrator = (project_admin) ? project_admin.username : 'NA';
          } else {
            (project as any).administrator = 'NA';
          }
        }
        this.projects = projects;
      }).catch((error) => {
        console.error(error);
      });
    }).catch((error) => {
      console.error(error);
    });
  }

  onProjectEdit(project: any) {
    this.router.navigate(['members/projects/add'], {
      queryParams: {
        edit: project.id
      }
    });
  }

  onProjectRemove(project: any) {
    this.modalService.openChoiceModal('Remove project', `Are you sure to remove the project '${project.name}' (${project.id})? If yes, choose one method. Be careful, you can't undo this action.`, [
      {
        label: 'Abort',
        value: 'abort',
        class: 'col-md-12 col-lg-4 btn btn-secondary'
      },
      {
        label: 'Remove all references (remove transcripts)',
        value: 'remove references',
        class: 'col-md-12 col-lg-4 btn btn-danger'
      },
      {
        label: 'Cut all references (keep transcripts)',
        value: 'cut references',
        class: 'col-md-12 col-lg-4 btn btn-info'
      }
    ], (choiceValue) => {
      if (choiceValue === 'abort') {
        return;
      }

      let reqData;
      if (choiceValue === 'remove references') {
        reqData = {
          removeAllReferences: true
        };
      } else if (choiceValue === 'cut references') {
        reqData = {
          cutAllReferences: true
        }
      }

      this.api.removeProject(project.id, reqData).then(() => {
        this.updateProjects();
      }).catch((error) => {
        console.error(error);
        this.modalService.openErrorModal('Removing Project failed', 'Can\'t remove project. The server reported an problem.');
      });
    });
  }
}
