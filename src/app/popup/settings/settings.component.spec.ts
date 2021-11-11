import { TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import {TestBrowserService} from '../../test-browser.service';

describe('SettingsComponent', () => {
  let component: SettingsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    component = new SettingsComponent(new TestBrowserService())
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
