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
import {UrlsComponent} from './popup/settings/urls/urls.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {XRefSourcesComponent} from './popup/settings/x-ref-sources/x-ref-sources.component';
import {SettingsComponent} from './popup/settings/settings.component';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {PDFSelectorComponent} from './popup/pdfselector/pdfselector.component'
import {PreferencesComponent} from './popup/settings/preferences/preferences.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatRadioModule, MAT_RADIO_DEFAULT_OPTIONS} from '@angular/material/radio';
import {MatCardModule} from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SidebarHeaderComponent } from './sidebar/sidebar-header/sidebar-header.component';
import { SidebarEntityListComponent } from './sidebar/sidebar-entity-list/sidebar-entity-list.component';
import { SidebarEntityComponent } from './sidebar/sidebar-entity/sidebar-entity.component';
import { SafeResourcePipe } from './safe-resource.pipe';
import { MatTableModule } from '@angular/material/table';
import { RecogniserNamePipe } from './popup/settings/recogniser-name.pipe';

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
    SidebarHeaderComponent,
    SidebarEntityListComponent,
    SidebarEntityComponent,
    SafeResourcePipe,
    RecogniserNamePipe,
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
    MatRadioModule,
    MatCardModule,
    MatTableModule,
    MatTooltipModule
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
