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

import { Injectable } from '@angular/core'
import { BrowserService } from '../browser.service'
import { EntitiesService } from './entities.service'
import { Entity } from '../../types/entity'
import { SettingsService } from './settings.service'
import { saveAs } from 'file-saver'
import { Recogniser } from '../../types/recognisers'

@Injectable({
  providedIn: 'root'
})
export class CsvExporterService {
  constructor(
    private browserService: BrowserService,
    private entitiesService: EntitiesService,
    private settingsService: SettingsService
  ) {
    this.browserService.addListener(msg => {
      switch (msg.type) {
        case 'csv_exporter_service_export_csv':
          return this.exportCSV()
      }
    })
  }

  private exportCSV(): Promise<void> {
    return this.browserService
      .getActiveTab()
      .then((currentTab: browser.tabs.Tab) => {
        const tabEntities = this.entitiesService.getTabEntities(currentTab.id!)

        return { currentTab, tabEntities }
      })
      .then(({ currentTab, tabEntities }) => {
        if (!!tabEntities) {
          const recogniser = this.settingsService.preferences.recogniser
          const entitiesArray = Array.from(tabEntities[recogniser]!.entities.values())

          if (!entitiesArray.length) {
            return
          }

          const CSVFormattedResults = this.entitiesToCSV(entitiesArray, recogniser)
          const fileName =
            'aurac_all_results_' + recogniser + '_' + this.sanitiseURL(currentTab.url!) + '.csv'

          this.browserService.sendMessageToActiveTab({
            type: 'content_script_download_all_results',
            body: {
              csvResults: CSVFormattedResults,
              csvFileName: fileName
            }
          })
        }
      })
  }

  sanitiseURL(url: string): string {
    return url!.replace(/^(https?|http):\/\//, '').split('#')[0]
  }

  // Converts the passed entities into a csv formatted string and appends headings to them
  entitiesToCSV(entities: Array<Entity>, recogniser: Recogniser): string {
    if (!entities.length) {
      return ''
    }

    const headings = ['Synonym', 'Identifier']
    let text = headings.join(',') + '\n'
    entities.forEach(entity => {
      entity.synonymToXPaths.forEach((_, synonymName) => {
        let key: string = ''
        switch (recogniser) {
          case 'swissprot-genes-proteins':
            key = 'Accession'
            break
          case 'leadmine-proteins':
          case 'leadmine-chemical-entities':
          case 'leadmine-disease':
            key = 'resolvedEntity'
            break
        }
        text = text + `"${synonymName}"` + ',' + entity.identifierSourceToID?.get(key) + '\n'
      })
    })

    return text
  }

  public saveAsCSV(text: string, fileName: string): void {
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8' })
    saveAs(blob, fileName)
  }
}
