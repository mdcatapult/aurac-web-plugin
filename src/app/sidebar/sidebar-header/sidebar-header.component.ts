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

import { Component } from '@angular/core'
import { BrowserService } from 'src/app/browser.service'
import { SidebarDataService } from '../sidebar-data.service'
import { CsvExporterService } from '../../background/csv-exporter.service'
import { MatSlideToggleChange } from '@angular/material/slide-toggle'
import { SettingsService } from '../../background/settings.service'
import { SidebarCard } from '../types'

@Component({
  selector: 'app-sidebar-header',
  templateUrl: './sidebar-header.component.html',
  styleUrls: ['./sidebar-header.component.scss']
})
export class SidebarHeaderComponent {
  imgSrc = ''
  isPageCompressed = true
  totalHighlights?: number
  error?: string

  constructor(
    private browserService: BrowserService,
    private sidebarDataService: SidebarDataService,
    private csvExporterService: CsvExporterService,
    private settingsService: SettingsService
  ) {
    this.imgSrc = this.browserService.getURL('assets/head-brains.png')
    this.sidebarDataService.totalCountInfoObservable.subscribe(count => {
      this.totalHighlights = count
    })
  }

  exportCSV() {
    const recogniser = this.settingsService.preferences.recogniser
    const csvText = this.csvExporterService.entitiesToCSV(
      this.sidebarDataService.cards.map(sidebarEntity => sidebarEntity.entity),
      recogniser
    )

    if (csvText) {
      this.browserService
        .sendMessageToBackground('entity_messenger_service_get_active_tab')
        .then(tab => {
          const fileName =
            'aurac_sidebar_results_' +
            recogniser +
            '_' +
            this.csvExporterService.sanitiseURL(tab.url!) +
            '.csv'
          this.csvExporterService.saveAsCSV(csvText, fileName)
        })
    }
  }

  clearCards() {
    this.sidebarDataService.setCards([])
  }

  compressedOrFloatingSidebar($event: MatSlideToggleChange) {
    this.browserService
      .sendMessageToBackground({
        type: 'entity_messenger_service_is_page_compressed',
        body: $event.checked
      })
      .then(result => {
        this.isPageCompressed = result
      })
  }
}
