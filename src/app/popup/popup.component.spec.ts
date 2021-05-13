import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PopupComponent } from './popup.component';
import { Component } from '@angular/core';

describe('PopupComponent', () => {
  let component: PopupComponent;
  let fixture: ComponentFixture<PopupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [
        PopupComponent,
        MockSettingsComponent
    ]})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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
