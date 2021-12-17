import { HttpClientTestingModule } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { BrowserService } from '../browser.service'
import { TestBrowserService } from '../test-browser.service'

import { XRefService } from './x-ref.service'

describe('XRefService', () => {
  let service: XRefService

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: BrowserService, useClass: TestBrowserService }]
    })
    service = TestBed.inject(XRefService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
