import { TestBed } from '@angular/core/testing';

import { XRefService } from './x-ref.service';

describe('XRefService', () => {
  let service: XRefService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(XRefService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
