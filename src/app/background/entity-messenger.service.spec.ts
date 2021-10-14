import { TestBed } from '@angular/core/testing';

import { EntityMessengerService } from './entity-messenger.service';

describe('EntityMessengerService', () => {
  let service: EntityMessengerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EntityMessengerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
