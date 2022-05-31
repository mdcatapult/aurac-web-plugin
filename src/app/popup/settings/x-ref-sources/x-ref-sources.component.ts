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
import { FormControl, FormGroup } from '@angular/forms'
import { SettingsService } from 'src/app/background/settings.service'
import { BrowserService } from 'src/app/browser.service'

@Component({
  selector: 'app-x-ref-sources',
  templateUrl: './x-ref-sources.component.html',
  styleUrls: ['./x-ref-sources.component.scss']
})
export class XRefSourcesComponent implements OnInit {
  form = new FormGroup({})
  hasXRefs = false

  constructor(private browserService: BrowserService, private settingsService: SettingsService) {}

  ngOnInit() {
    this.browserService
      .sendMessageToBackground({
        type: 'settings_service_refresh_xref_sources',
        body: this.settingsService.APIURLs.unichemURL
      })
      .then((xRefSources: string[]) => {
        xRefSources.forEach(source => {
          this.form.addControl(source, new FormControl(true))
        })

        if (xRefSources.length) {
          this.hasXRefs = true
        }

        if (Object.keys(this.settingsService.xRefSources).length) {
          this.form.reset(this.settingsService.xRefSources)
        }
      })

    // reset the form when xRefSourcesObservable emits
    this.settingsService.xRefSourcesObservable.subscribe(xrefs => this.form.reset(xrefs))
  }

  save(): void {
    if (this.form.valid) {
      this.browserService
        .sendMessageToBackground({
          type: 'settings_service_set_xrefs',
          body: this.form.value
        })
        .catch(error => console.error("couldn't send message 'settings_service_set_xrefs'", error))
    }
  }
}
