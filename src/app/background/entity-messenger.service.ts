import { Injectable } from '@angular/core';
import { InspectedHighlightData, parseHighlightID, XRef } from 'src/types';
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
    private xRefService: XRefService
    ) {

    this.entitiesService.changeStream$.subscribe(change => {
      if (change.setterInfo === 'noPropagate') {
        return
      }

      this.browserService.sendMessageToTab(change.identifier as number, {type: 'content_script_highlight_entities', body: stringifyWithTypes(change.result)})
        .then((stringifiedTabEntities) => {
          const tabEntities = parseWithTypes(stringifiedTabEntities)

          // Use 'noPropagate' setter info so that we don't get into an infinite loop.
          this.entitiesService.setTabEntities(change.identifier as number, tabEntities, 'noPropagate')
          this.browserService.sendMessageToTab(change.identifier as number, 'content_script_open_sidebar')
        })
    })

    this.browserService.addListener(msg => {
      switch (msg.type) {
        case 'entity_messenger_service_highlight_clicked':
          return new Promise((resolve, reject) => {
            try {
              const [entityName, entityOccurrence, synonym, synonymOccurrence] = parseHighlightID(msg.body)
              this.browserService.getActiveTab().then(tab => {
                const entity = this.entitiesService.getEntity({
                  tab: tab.id!,
                  recogniser: this.settingsService.preferences.recogniser,
                  identifier: entityName
                })!

                const getXrefs: Promise<XRef[]> = entity.xRefs ? Promise.resolve(entity.xRefs) : this.xRefService.get(entity)
               
                getXrefs.then(xRefs => {
                  entity.xRefs = xRefs
                  const inspectedHighlightData: InspectedHighlightData = {
                      entity,
                      entityName,
                      entityOccurrence,
                      clickedSynonymName: synonym,
                      synonymOccurrence
                    }

                    this.browserService.sendMessageToTab(tab.id!, {type: 'sidebar_component_inspect_highlight',
                      body: stringifyWithTypes(inspectedHighlightData)})
                })
              }).then(() => resolve(null))
            } catch (e) {
              reject(e)
            }
          })
        default:
      }
    })
  } 
}
