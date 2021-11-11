import { TestBed } from '@angular/core/testing'
import { BrowserService } from '../browser.service'
import { TestBrowserService } from '../test-browser.service'

import { SidebarDataService } from './sidebar-data.service'

describe('SidebarDataService', () => {
  let service: SidebarDataService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: BrowserService, useClass: TestBrowserService }]
    })
    service = TestBed.inject(SidebarDataService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
