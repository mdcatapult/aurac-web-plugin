import {Injectable} from '@angular/core';
import {BrowserService} from '../browser.service';
import {EntitiesService} from './entities.service';
import {Entity} from '../../types';
import {SettingsService} from './settings.service';
import {saveAs} from 'file-saver';

export type CSVEntity = {
  metadata: any,
  identifiers: Map<string, string>,
  synonyms: Array<string>,
}

@Injectable({
  providedIn: 'root'
})

export class CsvExporterService {

  constructor(
    private browserService: BrowserService,
    private entitiesService: EntitiesService,
    private settingsService: SettingsService
  ) {
    this.browserService.addListener((msg) => {
      switch (msg.type) {
        case 'csv_exporter_service_export_csv':
          return this.exportCSV();
      }
    });
  }

  private exportCSV(): Promise<void> {
    return this.browserService.getActiveTab()
      .then((currentTab: browser.tabs.Tab) => {
        const tabEntities = this.entitiesService.getTabEntities(currentTab.id!);
        return {currentTab, tabEntities}
      })
      .then(({currentTab, tabEntities}) => {
        if (!!tabEntities) {
          const recogniser = this.settingsService.preferences.recogniser;
          switch (recogniser) {
            case 'leadmine-proteins':
            case 'leadmine-chemical-entities':
            case 'leadmine-diseases':

              const entities: Map<string, Entity> = tabEntities[recogniser]!.entities;
              const CSVEntitiesArray: Array<CSVEntity> = Array.from(entities.values()).map(entity => {
                return {
                  metadata: entity.metadata,
                  identifiers: entity.identifierSourceToID!,
                  synonyms: Array.from(entity.synonymToXPaths.keys())}
              })

              if (entities.size < 1) {

                return;
              }

              const CSVFormattedResults = this.leadmineToCSV(CSVEntitiesArray);
              this.saveAsCSV(CSVFormattedResults, currentTab.url!, 'aurac_all_results_')
          }
        }
      });
  }

  private sanitiseURL(url: string): string {
    return url!.replace(/^(https?|http):\/\//, '').split('#')[0]
  }

  // Converts the passed entities into a csv formatted string and appends headings to them
  leadmineToCSV(csvEntities: Array<CSVEntity>): string {
    const headings = [
      'Synonym',
      'Resolved Entity',
      'Entity Group',
      'Enforce Bracketing',
      'Entity Type',
      'HTML Color',
      'Maximum Correction Distance',
      'Minimum Corrected Entity Length',
      'Minimum Entity Length',
      'Source'
    ];

    let text = headings.join(',') + '\n';
    csvEntities.forEach(csvEntity => {
      csvEntity.synonyms.forEach(synonymName => {
        text = text + `"${synonymName}"` + ','
          + csvEntity.identifiers?.get('resolvedEntity') + ','
          + csvEntity.metadata.entityGroup! + ','
          + csvEntity.metadata.RecognisingDict.enforceBracketing + ','
          + csvEntity.metadata.RecognisingDict.entityType + ','
          + csvEntity.metadata.RecognisingDict.htmlColor + ','
          + csvEntity.metadata.RecognisingDict.maxCorrectionDistance + ','
          + csvEntity.metadata.RecognisingDict.minimumCorrectedEntityLength + ','
          + csvEntity.metadata.RecognisingDict.minimumEntityLength + ','
          + csvEntity.metadata.RecognisingDict.source + '\n';
      });
    });

    return text;
  }

  public saveAsCSV(text: string, currentURL: string, prefix: 'aurac_all_results_' | 'aurac_sidebar_results_'): void {
    const sanitisedURL = this.sanitiseURL(currentURL)
    const blob = new Blob([text], {type: 'text/csv;charset=utf-8'})
    saveAs(blob, prefix + sanitisedURL + '.csv')
  }

}
