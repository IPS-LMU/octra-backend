import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SettingsLoadedGuard} from './settings-loaded.guard';
import {LoadingComponent} from './loading/loading.component';
import {AuthenticationGuard} from './pages/members-area/authentication.guard';
import {LoginGuard} from './pages/login-page/login.guard';
import {LoginPageComponent} from './pages/login-page/login-page.component';
import {MembersAreaComponent} from './pages/members-area/members-area.component';
import {MEMBERSAREA_ROUTES} from './pages/members-area/members-area.routes';

const routes: Routes = [
  {
    path: '', redirectTo: 'login', pathMatch: 'full'
  },
  {
    path: 'loading', component: LoadingComponent, canActivate: [AuthenticationGuard, SettingsLoadedGuard]
  },
  {
    path: 'login', component: LoginPageComponent, canActivate: [LoginGuard, SettingsLoadedGuard]
  },
  {
    path: 'members',
    component: MembersAreaComponent,
    canActivate: [AuthenticationGuard, SettingsLoadedGuard],
    children: MEMBERSAREA_ROUTES
  },
  {
    path: '**', redirectTo: 'login', pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
