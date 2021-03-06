/*
 * Copyright 2022 Medicines Discovery Catapult
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormControl, Validators } from '@angular/forms'
import { combineLatest } from 'rxjs'
import { map, pairwise } from 'rxjs/operators'
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

  showSpecies(): boolean {
    return (
      (this.form.get('recogniser')!.value as Recogniser) === 'swissprot-genes-proteins' ||
      (this.recognisers.length === 1 && this.recognisers[0] === 'swissprot-genes-proteins')
    )
  }
}
