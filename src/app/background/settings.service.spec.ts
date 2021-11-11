import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserService } from '../browser.service';
import { TestBrowserService } from '../test-browser.service';

import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let testBrowserService: TestBrowserService

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: BrowserService, useClass: TestBrowserService },
      ]
    });
    service = TestBed.inject(SettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
