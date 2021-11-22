import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { BackgroundComponent } from './background.component'
import { TestBrowserService } from '../test-browser.service'
import { HttpClient, HttpHandler } from '@angular/common/http'
// import {LeadminerEntity} from '../../types';
import { BrowserService } from '../browser.service'
import { SettingsService } from './settings.service'

describe('BackgroundComponent', () => {
  let testBrowserService: TestBrowserService
  let httpClient: HttpClient
  let fixture: ComponentFixture<BackgroundComponent>
  let backgroundComponent: BackgroundComponent

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [BackgroundComponent],
        providers: [
          HttpClient,
          HttpHandler,
          { provide: BrowserService, useClass: TestBrowserService }
        ]
      }).compileComponents()
    })
  )

  beforeEach(() => {
    httpClient = TestBed.inject(HttpClient)
    testBrowserService = TestBed.inject(TestBrowserService)

    fixture = TestBed.createComponent(BackgroundComponent)
    backgroundComponent = fixture.componentInstance
  })

  it('should create', () => {
    expect(backgroundComponent).toBeTruthy()
  })

  it('should create unique entities', () => {
    // const leadmineEntities = getLeadminerEntities(['protein', 'protein', 'sometext'])
    // const result = backgroundComponent.getUniqueEntities(leadmineEntities);
    // expect(result.length).toBe(2);
  })

  // it('unique entities should filter entities whose length is less than minEntityLength', () => {
  //   const leadmineEntities = getLeadminerEntities(['foo', 'bar', 'some'])
  //   const tests = [{
  //     minEntityLength: 5,
  //     expected: 0,
  //   }, {
  //     minEntityLength: 4,
  //     expected: 1,
  //   }, {
  //     minEntityLength: 3,
  //     expected: 3
  //   }, {
  //     minEntityLength: 0,
  //     expected: 3,
  //   }]
  //   tests.forEach(test => {
  //     backgroundComponent.settings.preferences.minEntityLength = test.minEntityLength
  //     const result = backgroundComponent.getUniqueEntities(leadmineEntities);
  //     expect(result.length).toBe(test.expected);
  //   })
  // })

  // function getLeadminerEntities(entities: string[]): LeadminerEntity[] {
  //   return entities.map(entity => {
  //     return {
  //       beg: 0,
  //       begInNormalizedDoc: 0,
  //       end: 0,
  //       endInNormalizedDoc: 0,
  //       entityGroup: '',
  //       entityText: entity,
  //       possiblyCorrectedText: '',
  //       recognisingDict: undefined,
  //       resolvedEntity: '',
  //       sectionType: ''
  //     }
  //   })
  // }
})
