import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { BackgroundComponent } from './background/background.component';
import { LoggerComponent } from './background/logger/logger.component';
import { PopupComponent } from './popup/popup.component';
import { RouterComponent } from './router/router.component';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import {UrlsComponent} from './urls/urls.component';
import {ReactiveFormsModule} from '@angular/forms';
import { XRefSourcesComponent } from './x-ref-sources/x-ref-sources.component';
import { SettingsComponent } from './settings/settings.component';
import { PreferencesComponent } from './preferences/preferences.component';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

const routes: Routes = [
  {path: '**', component: RouterComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    BackgroundComponent,
    LoggerComponent,
    PopupComponent,
    RouterComponent,
    UrlsComponent,
    XRefSourcesComponent,
    SettingsComponent,
    PreferencesComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes, {relativeLinkResolution: 'legacy'}),
    HttpClientModule,
    ReactiveFormsModule,
    MatTabsModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatFormFieldModule
  ],
  providers: [{provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'fill'}}],
  bootstrap: [AppComponent]
})
export class AppModule { }
