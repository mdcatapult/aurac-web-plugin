import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import {Preferences} from '../../types';
import {BrowserService} from '../browser.service';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss']
})
export class PreferencesComponent implements OnInit, OnChanges {

  @Input() preferencesForm?: FormGroup;
  @Input() settings: Preferences = {} as Preferences;

  constructor(private browserService: BrowserService) {}

  ngOnInit(): void {
    this.browserService.loadSettings().then(settings => {
      this.refresh(settings.preferences)
    })
  }

  ngOnChanges(): void {}

  private refresh(preferences: Preferences): void {
      Object.keys(this.settings).forEach(pref => {
        const initialValue = preferences[pref as keyof Preferences]
        this.preferencesForm!.addControl(pref, new FormControl(initialValue))
      })
    }

}
