import { Injectable } from '@angular/core';
import { ClickedHighlightData, parseHighlightID, XRef } from 'src/types';
import { parseWithTypes, stringifyWithTypes } from '../../json';
import { BrowserService } from '../browser.service';
import { EntitiesService } from './entities.service';
import { SettingsService } from './settings.service';
import { XRefService } from './x-ref.service';

@Injectable({
  providedIn: 'root'
})
export class EntityMessengerService {

  constructor(
    private browserService: BrowserService,
    private entitiesService: EntitiesService,
    private settingsService: SettingsService,
    private xRefService: XRefService) {

    this.entitiesService.entityChangeObservable.subscribe(change => {
      if (change.setterInfo === 'noPropagate') {
        return
      }

      this.browserService.sendMessageToTab(change.tabID, { type: 'content_script_highlight_entities', body: stringifyWithTypes(change.entities) })
        .then((stringifiedTabEntities) => {
          const tabEntities = parseWithTypes(stringifiedTabEntities)

          // Use 'noPropagate' setter info so that we don't get into an infinite loop.
          this.entitiesService.setTabEntities(change.tabID, tabEntities, 'noPropagate')
          this.browserService.sendMessageToTab(change.tabID, 'content_script_open_sidebar')
        })
    })

    this.browserService.addListener(msg => {
      switch (msg.type) {
        case 'entity_messenger_service_highlight_clicked':
          return this.highlightClicked(msg.body)
        default:
      }
    })
  }

  highlightClicked(elementID: string): Promise<void> {
    const [entityName, entityOccurrence, synonym, synonymOccurrence] = parseHighlightID(elementID)
    return this.browserService.getActiveTab().then(tab => {
      const entity = this.entitiesService.getEntity(tab.id!, this.settingsService.preferences.recogniser, entityName)!

      const getXrefs: Promise<XRef[]> = entity.xRefs ? Promise.resolve(entity.xRefs) : this.xRefService.get(entity)

      getXrefs.then(xRefs => {
        entity.xRefs = xRefs
        const clickedHighlightData: ClickedHighlightData = {
          entity,
          clickedEntityID: entityName,
          clickedEntityOccurrence: entityOccurrence,
          clickedSynonymName: synonym,
          clickedSynonymOccurrence: synonymOccurrence
        }

        this.browserService.sendMessageToTab(tab.id!, {
          type: 'sidebar_data_service_view_or_create_clicked_entity',
          body: stringifyWithTypes(clickedHighlightData)
        })
      })
    })
  }
}
