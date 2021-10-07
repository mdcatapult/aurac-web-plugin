import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {BackgroundComponent} from './background.component';
import {TestBrowserService} from '../test-browser.service';
import {HttpClient, HttpHandler} from '@angular/common/http';
import {LeadminerEntity} from '../../types';
import {BrowserService} from '../browser.service';

describe('BackgroundComponent', () => {
  let testBrowserService: TestBrowserService;
  let httpClient: HttpClient;
  let fixture: ComponentFixture<BackgroundComponent>
  let backgroundComponent: BackgroundComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        BackgroundComponent,
      ],
      providers: [
        HttpClient,
        HttpHandler,
        {provide: BrowserService, useClass: TestBrowserService}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {

    httpClient = TestBed.inject(HttpClient)
    testBrowserService = TestBed.inject(TestBrowserService)

    fixture = TestBed.createComponent(BackgroundComponent);
    backgroundComponent = fixture.componentInstance;
  });

  it('should create', () => {
    expect(backgroundComponent).toBeTruthy();
  });

  it('should create unique entities', () => {
    const leadmineEntities: Array<LeadminerEntity> = ['protein', 'protein', 'sometext'].map(entity => {
      const leadmineEntity =  {
      beg: 0,
      begInNormalizedDoc: 0,
      end: 0,
      endInNormalizedDoc: 0,
      entityGroup: '',
      entityText: entity,
      possiblyCorrectedText: '',
      recognisingDict: undefined,
      resolvedEntity: '',
      sectionType: ''
    }
      return leadmineEntity;
    })
    const result = backgroundComponent.getUniqueEntities(leadmineEntities);
    expect(result.length).toBe(2);
  });
});

