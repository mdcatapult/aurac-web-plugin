import { TestBed } from '@angular/core/testing';
import { TestBrowserService } from '../test-browser.service';

import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let testBrowserService: TestBrowserService

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
