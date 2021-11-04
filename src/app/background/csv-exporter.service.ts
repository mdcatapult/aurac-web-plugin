import { Injectable } from '@angular/core';
import {BrowserService} from '../browser.service';
import {EntitiesService} from './entities.service';
import {Entity, TabEntities} from '../../types';
import {SettingsService} from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class CsvExporterService {

  constructor(
    private browserService: BrowserService,
    private entitiesService: EntitiesService,
    private settingsService: SettingsService) {
    this.browserService.addListener((msg) => {
      switch (msg.type) {
        case 'csv_exporter_export_csv':
          this.exportCSV()
      }
    })
  }

  private exportCSV() {
    this.browserService.getActiveTab()
      .then((currentTab: browser.tabs.Tab) => this.entitiesService.getTabEntities(currentTab.id))
      .then((tabEntities: TabEntities) => {
        const recogniser = this.settingsService.preferences.recogniser
        const entities: Map<string, Entity> = tabEntities[recogniser].entities
        console.log(entities)
        if (entities.size < 1) {
          return
        }
        const headings = [
          'entityText',
          'resolvedEntity',
          'sectionType',
          'entityGroup',
          'enforceBracketing',
          'entityType',
          'htmlColor',
          'maxCorrectionDistance',
          'minimumCorrectedEntityLength',
          'minimumEntityLength',
          'source']

      })

  }



}
