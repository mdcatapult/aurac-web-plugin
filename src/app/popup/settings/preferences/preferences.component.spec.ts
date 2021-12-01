import { ComponentFixture, TestBed } from '@angular/core/testing'
import { PreferencesComponent } from './preferences.component'
import { RecogniserNamePipe } from '../recogniser-name.pipe'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { BrowserService } from 'src/app/browser.service'
import { TestBrowserService } from 'src/app/test-browser.service'

describe('PreferencesComponent', () => {
  let component: PreferencesComponent
  let fixture: ComponentFixture<PreferencesComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: BrowserService, useClass: TestBrowserService }],
      declarations: [PreferencesComponent, RecogniserNamePipe]
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(PreferencesComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
