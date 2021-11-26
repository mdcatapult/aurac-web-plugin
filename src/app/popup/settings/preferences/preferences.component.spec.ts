import { ComponentFixture, TestBed } from '@angular/core/testing'

import { PreferencesComponent } from './preferences.component'
import { FormBuilder, FormControl } from '@angular/forms'
import { defaultSettings } from 'src/types/settings'
import { RecogniserNamePipe } from '../recogniser-name.pipe'

describe('PreferencesComponent', () => {
  let component: PreferencesComponent
  let fixture: ComponentFixture<PreferencesComponent>
  const fb = new FormBuilder()

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
