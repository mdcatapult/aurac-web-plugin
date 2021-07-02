import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PopupComponent } from './popup.component';
import { Component } from '@angular/core';
import { TestBrowserService } from '../test-browser.service';

describe('PopupComponent', () => {
  let component: TestBrowserService;
  // ComponentFixtures enable you to debug your tests. This does not currently work with our TestBrowserService as we get IVY compiler
  // errors
  // let fixture: ComponentFixture<TestBrowserService>;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        PopupComponent,
        MockSettingsComponent
      ]})
      .compileComponents();
  }));

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.inject(TestBrowserService);
    // fixture = TestBed.createComponent(TestBrowserService);
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
@Component({
  selector: 'app-settings',
  template: ''
})
class MockSettingsComponent {
}
