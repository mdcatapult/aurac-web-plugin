import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { PopupComponent } from './popup.component'
import { Component } from '@angular/core'
import { TestBrowserService } from '../test-browser.service'

describe('PopupComponent', () => {
  let component: TestBrowserService

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [PopupComponent, MockSettingsComponent]
      }).compileComponents()
    })
  )

  beforeEach(() => {
    TestBed.configureTestingModule({})
    component = TestBed.inject(TestBrowserService)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
@Component({
  selector: 'app-settings',
  template: ''
})
class MockSettingsComponent {}
