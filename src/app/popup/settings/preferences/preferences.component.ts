import { Component, Input, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { SettingsService } from 'src/app/background/settings.service'
import { BrowserService } from 'src/app/browser.service'
import { defaultSettings } from 'src/types/settings'
import { allRecognisers } from '../../../../types/recognisers'

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss']
})
export class PreferencesComponent implements OnInit {
  minEntityLength = [...Array(50).keys()].slice(2)
  isLoaded = false
  recognisers = allRecognisers()

  private fb = new FormBuilder()
  form = this.fb.group({
    minEntityLength: new FormControl(
      defaultSettings.preferences.minEntityLength,
      Validators.required
    ),
    recogniser: new FormControl(defaultSettings.preferences.recogniser)
  })

  constructor(private browserService: BrowserService, private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.settingsService.preferencesObservable.subscribe(prefs => this.form.reset(prefs))

    this.form.valueChanges.subscribe(preferences => this.save(preferences))
  }

  save(preferences: { minEntityLength: number; recogniser: string }): void {
    this.browserService
      .sendMessageToBackground({
        type: 'settings_service_set_preferences',
        body: preferences
      })
      .catch(error =>
        console.error("couldn't send message 'settings_service_set_preferences'", error)
      )
  }
}