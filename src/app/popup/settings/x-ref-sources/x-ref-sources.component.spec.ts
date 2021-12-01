import { ComponentFixture, TestBed } from '@angular/core/testing'
import { XRefSourcesComponent } from './x-ref-sources.component'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { BrowserService } from 'src/app/browser.service'
import { TestBrowserService } from 'src/app/test-browser.service'

describe('XRefSourcesComponent', () => {
  let component: XRefSourcesComponent
  let fixture: ComponentFixture<XRefSourcesComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: BrowserService, useClass: TestBrowserService }],
      declarations: [XRefSourcesComponent]
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(XRefSourcesComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
