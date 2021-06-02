import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {ModalModule} from 'ngx-bootstrap/modal';
import {BsDatepickerModule} from 'ngx-bootstrap/datepicker';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {FormsModule} from '@angular/forms';
import {APIService} from './api.service';
import {HttpClientModule} from '@angular/common/http';
import {NgxWebstorageModule} from 'ngx-webstorage';
import {SettingsService} from './settings.service';
import {JoinPipe} from './pipes/join.pipe';
import {FaIconLibrary, FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {fas} from '@fortawesome/free-solid-svg-icons';
import {far} from '@fortawesome/free-regular-svg-icons';
import {LoadingComponent} from './loading/loading.component';
import {LoginPageComponent} from './pages/login-page/login-page.component';
import {MembersAreaComponent} from './pages/members-area/members-area.component';
import {DashboardComponent} from './pages/members-area/dashboard-page/dashboard.component';
import {ApptokensComponent} from './pages/members-area/apptokens/apptokens.component';
import {UsersPage} from './pages/members-area/users-page/users.page';
import {SettingsComponent} from './pages/members-area/settings/settings.component';
import {ModalsComponent} from './modals/modals.component';
import {ModalsService} from './modals/modals.service';
import {ErrorModalComponent} from './modals/error/error-modal.component';
import {AddAppTokenComponent} from './pages/members-area/apptokens/add-app-token/add-app-token.component';
import {NotFoundPageComponent} from './pages/not-found-page/not-found-page.component';
import {SuccessModalComponent} from './modals/success/success-modal.component';
import {ProfileComponent} from './pages/members-area/profile/profile.component';
import {ProjectsComponent} from './pages/members-area/projects/projects.component';
import {AddProjectComponent} from './pages/members-area/projects/add-project/add-project.component';
import {UserDropdownComponent} from './components/user-dropdown/user-dropdown.component';
import {BsDropdownModule} from 'ngx-bootstrap/dropdown';
import {TimepickerModule} from 'ngx-bootstrap/timepicker';
import {ChoiceModalComponent} from './modals/choice-modal/choice-modal.component';
import {ProjectConfigModalComponent} from './modals/projectconfig-modal/project-config-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    DashboardComponent,
    ApptokensComponent,
    MembersAreaComponent,
    UsersPage,
    SettingsComponent,
    JoinPipe,
    LoadingComponent,
    ModalsComponent,
    ErrorModalComponent,
    SuccessModalComponent,
    ChoiceModalComponent,
    AddAppTokenComponent,
    NotFoundPageComponent,
    ProfileComponent,
    ProjectsComponent,
    AddProjectComponent,
    UserDropdownComponent,
    ProjectConfigModalComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    NgxWebstorageModule.forRoot(),
    FontAwesomeModule,
    ModalModule.forRoot(),
    BrowserAnimationsModule,
    BsDatepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    TimepickerModule.forRoot()
  ],
  providers: [SettingsService, APIService, ModalsService],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas, far);
  }
}
