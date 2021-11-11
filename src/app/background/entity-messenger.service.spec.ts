import { HttpClientTestingModule } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { BrowserService } from '../browser.service'
import { TestBrowserService } from '../test-browser.service'

import { EntityMessengerService } from './entity-messenger.service'

describe('EntityMessengerService', () => {
  let service: EntityMessengerService

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: BrowserService, useClass: TestBrowserService }]
    })
    service = TestBed.inject(EntityMessengerService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
