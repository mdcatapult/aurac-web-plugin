import { TestBed } from '@angular/core/testing';

import { TestBrowserService } from './test-browser.service';

describe('TestBrowserService', () => {
  let service: TestBrowserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestBrowserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
