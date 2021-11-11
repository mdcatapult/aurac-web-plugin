import { Injectable } from '@angular/core';
import { XRef } from 'src/types/entity';
import { parseHighlightID } from 'src/types/highlights';
import { parseWithTypes, stringifyWithTypes } from '../../json';
import { BrowserService } from '../browser.service';
import { SidebarCard } from '../sidebar/types';
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
    const [entityID, entityOccurrence, synonymName, synonymOccurrence] = parseHighlightID(elementID)
    return this.browserService.getActiveTab().then(tab => {
      const entity = this.entitiesService.getEntity(tab.id!, this.settingsService.preferences.recogniser, entityID)!

      const getXrefs: Promise<XRef[]> = entity.xRefs ? Promise.resolve(entity.xRefs) : this.xRefService.get(entity)

      getXrefs.then(xRefs => {
        entity.xRefs = xRefs
        const sidebarCard: SidebarCard = {
          recogniser: this.settingsService.preferences.recogniser,
          entity,
          entityID: entityID,
          clickedEntityOccurrence: entityOccurrence,
          clickedSynonymName: synonymName,
          clickedSynonymOccurrence: synonymOccurrence
        }

        this.browserService.sendMessageToTab(tab.id!, {
          type: 'sidebar_data_service_view_or_create_card',
          body: stringifyWithTypes(sidebarCard)
        })
      })
    })
  }
}
