import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreferencesComponent } from './preferences.component';
import {FormBuilder, FormControl} from '@angular/forms';
import {defaultSettings} from 'src/types';

describe('PreferencesComponent', () => {
  let component: PreferencesComponent;
  let fixture: ComponentFixture<PreferencesComponent>;
  const fb = new FormBuilder();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreferencesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreferencesComponent);
    component = fixture.componentInstance;
    component.preferencesForm = fb.group({
      hideUnresolved: new FormControl(
        defaultSettings.preferences.hideUnresolved
      ),
      minEntityLength: new FormControl(
        defaultSettings.preferences.minEntityLength
      )
    })
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
