import {Route} from '@angular/router';
import {DashboardComponent} from './dashboard-page/dashboard.component';
import {SettingsComponent} from './settings/settings.component';
import {AdministratorOnlyGuard} from './administrator-only-guard.service';
import {APIInitializeGuard} from '../../apiinitialize.guard';
import {ApptokensComponent} from './apptokens/apptokens.component';
import {AddAppTokenComponent} from './apptokens/add-app-token/add-app-token.component';
import {NotFoundPageComponent} from '../not-found-page/not-found-page.component';
import {ProfileComponent} from './profile/profile.component';
import {ProjectsComponent} from './projects/projects.component';
import {AddProjectComponent} from './projects/add-project/add-project.component';
import {AccountsPage} from './accounts/accounts.page';

export const MEMBERSAREA_ROUTES: Route[] = [
  {
    path: 'dashboard', component: DashboardComponent, canActivate: [APIInitializeGuard, AdministratorOnlyGuard]
  },
  {
    path: 'apptokens', component: ApptokensComponent, canActivate: [APIInitializeGuard, AdministratorOnlyGuard]
  },
  {
    path: 'projects', component: ProjectsComponent, canActivate: [APIInitializeGuard, AdministratorOnlyGuard]
  },
  {
    path: 'project/add', component: AddProjectComponent, canActivate: [APIInitializeGuard, AdministratorOnlyGuard]
  },
  {
    path: 'apptokens/add', component: AddAppTokenComponent, canActivate: [APIInitializeGuard, AdministratorOnlyGuard]
  },
  {
    path: 'accounts', component: AccountsPage, canActivate: [APIInitializeGuard, AdministratorOnlyGuard]
  },
  {
    path: 'settings', component: SettingsComponent, canActivate: [APIInitializeGuard, AdministratorOnlyGuard]
  },
  {
    path: 'profile', component: ProfileComponent, canActivate: [APIInitializeGuard]
  },
  {
    path: '404', component: NotFoundPageComponent,
  },
  {
    path: '**', redirectTo: '404', pathMatch: 'full'
  }
];
