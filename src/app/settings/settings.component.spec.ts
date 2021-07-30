import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import {TestBrowserService} from './../test-browser.service';
import {LogService} from '../popup/log.service';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    component = new SettingsComponent(new LogService(), new TestBrowserService(new LogService()))
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
