import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BackgroundComponent } from './background/background.component';
import { LoggerComponent } from './background/logger/logger.component';
import { PopupComponent } from './popup/popup.component';
import { RouterComponent } from './router/router.component';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import {SettingsComponent} from './settings/settings.component';
import {ReactiveFormsModule} from '@angular/forms';

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
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes, {relativeLinkResolution: 'legacy'}),
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
