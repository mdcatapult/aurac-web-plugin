import { TestBed, waitForAsync } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Component } from '@angular/core';

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        MockRouterComponent
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'browser-plugin'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('browser-plugin');
  });
});
@Component({
  selector: 'router-outlet',
  template: ''
})
class MockRouterComponent {
}
