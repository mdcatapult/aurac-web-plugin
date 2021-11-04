import { TestBed } from '@angular/core/testing';

import { SidebarDataService } from './sidebar-data.service';

describe('SidebarDataService', () => {
  let service: SidebarDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SidebarDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
