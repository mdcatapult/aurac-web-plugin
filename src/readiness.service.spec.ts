import { TestBed } from '@angular/core/testing';

import { ReadinessService } from './readiness.service';

describe('ReadinessService', () => {
  let service: ReadinessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReadinessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
