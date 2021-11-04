import {Injectable} from '@angular/core';
import {BrowserService} from '../browser.service';
import {EntitiesService} from './entities.service';
import {Entity} from '../../types';
import {SettingsService} from './settings.service';
import {saveAs} from 'file-saver';

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
          this.exportCSV();
      }
    });
  }


  private exportCSV() {
    this.browserService.getActiveTab()
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
              console.log(entities);
              if (entities.size < 1) {
                return;
              }

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
                'Source'];

              let text = headings.join(',') + '\n';
              entities.forEach(entity => {
                entity.synonyms.forEach((synonymData, synonymName) => {
                  text = text + `"${synonymName}"` + ','
                    + entity.identifiers!.get('resolvedEntity') + ','
                    + entity.metadata.entityGroup! + ','
                    + entity.metadata.RecognisingDict.enforceBracketing + ','
                    + entity.metadata.RecognisingDict.entityType + ','
                    + entity.metadata.RecognisingDict.htmlColor + ','
                    + entity.metadata.RecognisingDict.maxCorrectionDistance + ','
                    + entity.metadata.RecognisingDict.minimumCorrectedEntityLength + ','
                    + entity.metadata.RecognisingDict.minimumEntityLength + ','
                    + entity.metadata.RecognisingDict.source + '\n';
                });
              });

              this.exportToCSV(text, currentTab.url!)
              break;
          }
        }
      });
  }

  private exportToCSV(text: string, currentURL: string): void {
    const blob = new Blob([text], {type: 'text/csv;charset=utf-8'})
    saveAs(blob, 'aurac_all_results_' + currentURL + '.csv')
  }

}
