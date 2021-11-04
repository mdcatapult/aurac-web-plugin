import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import { CsvExporterService } from './csv-exporter.service';
import {HttpClient, HttpHandler} from '@angular/common/http';
import {BackgroundComponent} from './background.component';
import {BrowserService} from '../browser.service';
import {TestBrowserService} from '../test-browser.service';
import {EntitiesService} from './entities.service';
import {SettingsService} from './settings.service';

fdescribe('CsvExporterService', () => {
  let service: CsvExporterService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        HttpClient,
        HttpHandler,
        {provide: BrowserService, useClass: TestBrowserService},
        CsvExporterService,
        EntitiesService,
        SettingsService
      ]
    })
    service = TestBed.inject(CsvExporterService)
  }));


  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
