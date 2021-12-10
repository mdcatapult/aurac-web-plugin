import { Injectable } from '@angular/core'
import { BrowserService } from '../browser.service'
import { EntitiesService } from './entities.service'
import { Entity } from '../../types/entity'
import { SettingsService } from './settings.service'
import { saveAs } from 'file-saver'

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
          switch (recogniser) {
            case 'leadmine-proteins':
            case 'leadmine-chemical-entities':
            case 'leadmine-disease':
              const entities: Map<string, Entity> = tabEntities[recogniser]!.entities
              const entitiesArray: Array<Entity> = Array.from(entities.values())

              if (entities.size < 1) {
                return
              }

              const CSVFormattedResults = this.leadmineToCSV(entitiesArray)
              const fileName = 'aurac_all_results_' + this.sanitiseURL(currentTab.url!) + '.csv'
              this.saveAsCSV(CSVFormattedResults, fileName)
          }
        }
      })
  }

  sanitiseURL(url: string): string {
    return url!.replace(/^(https?|http):\/\//, '').split('#')[0]
  }

  // Converts the passed entities into a csv formatted string and appends headings to them
  leadmineToCSV(entities: Array<Entity>): string {
    if (!entities.length) {
      return ''
    }

    const headings = ['Synonym', 'Identifier']

    let text = headings.join(',') + '\n'
    entities.forEach(entity => {
      entity.synonymToXPaths.forEach((_, synonymName) => {
        text =
          text +
          `"${synonymName}"` +
          ',' +
          entity.identifierSourceToID?.get('resolvedEntity') +
          '\n'
      })
    })

    return text
  }

  public saveAsCSV(text: string, fileName: string): void {
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8' })
    saveAs(blob, fileName)
  }
}
