import { Component, Input, OnInit, OptionalDecorator } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { minBy } from 'lodash'
import { combineLatest } from 'rxjs'
import { map, pairwise, skip, tap } from 'rxjs/operators'
import { SettingsService } from 'src/app/background/settings.service'
import { BrowserService } from 'src/app/browser.service'
import { defaultSettings, Preferences } from 'src/types/settings'
import { allSpecies } from 'src/types/species'
import { allRecognisers, Recogniser } from '../../../../types/recognisers'

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss']
})
export class PreferencesComponent implements OnInit {
  minEntityLength = [...Array(50).keys()].slice(2)
  isLoaded = false
  recognisers = allRecognisers()
  allSpecies = allSpecies()

  private fb = new FormBuilder()
  form = this.fb.group({
    minEntityLength: new FormControl(
      defaultSettings.preferences.minEntityLength,
      Validators.required
    ),
    recogniser: new FormControl(defaultSettings.preferences.recogniser),
    species: new FormControl(defaultSettings.preferences.species)
  })

  constructor(private browserService: BrowserService, private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.settingsService.preferencesObservable.subscribe(prefs => this.form.reset(prefs))

    this.form.valueChanges.subscribe(preferences => this.save(preferences))

    combineLatest([
      this.form.get('minEntityLength')!.valueChanges,
      this.form.get('species')!.valueChanges
    ])
      .pipe(
        pairwise(),
        map((values: [[number, string], [number, string]]) => {
          const [[oldMinEntityLength, oldSpecies], [newMinEntityLength, newSpecies]] = values
          if (newSpecies !== oldSpecies) {
            this.browserService.sendMessageToBackground('sidebar_data_remove_cards')
          }

          return [newMinEntityLength, newSpecies]
        })
      )
      .subscribe(([minEntityLength, species]) => {
        console.log('subscribe', minEntityLength, species)
        this.browserService.sendMessageToBackground({
          type: 'entity_messenger_service_filters_changed',
          body: { minEntityLength: minEntityLength, species: species }
        })
      })
  }

  save(preferences: Preferences): void {
    this.browserService
      .sendMessageToBackground({
        type: 'settings_service_set_preferences',
        body: preferences
      })
      .catch(error =>
        console.error("couldn't send message 'settings_service_set_preferences'", error)
      )
  }

  isSwissprot(): boolean {
    return (this.form.get('recogniser')!.value as Recogniser) === 'swissprot-genes-proteins'
  }
}
