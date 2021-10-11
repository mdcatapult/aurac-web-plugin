import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppComponent} from './app.component';
import {BackgroundComponent} from './background/background.component';
import {LoggerComponent} from './background/logger/logger.component';
import {PopupComponent} from './popup/popup.component';
import {RouterComponent} from './router/router.component';
import {Routes, RouterModule} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';
import {UrlsComponent} from './urls/urls.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {XRefSourcesComponent} from './x-ref-sources/x-ref-sources.component';
import {SettingsComponent} from './settings/settings.component';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {PDFSelectorComponent} from './pdfselector/pdfselector.component'
import {PreferencesComponent} from './preferences/preferences.component';
import {MatRadioModule, MAT_RADIO_DEFAULT_OPTIONS} from '@angular/material/radio';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';


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
    PreferencesComponent,
    PDFSelectorComponent,
    SidebarComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes, {relativeLinkResolution: 'legacy'}),
    HttpClientModule,
    ReactiveFormsModule,
    MatTabsModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatRadioModule
  ],
  providers: [
    {
      provide: MAT_RADIO_DEFAULT_OPTIONS,
      useValue: {color: 'accent'}
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
