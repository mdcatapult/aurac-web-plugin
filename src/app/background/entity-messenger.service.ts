import { Injectable } from '@angular/core'
import { TabEntities, XRef } from 'src/types/entity'
import { parseHighlightID } from 'src/types/highlights'
import { parseWithTypes, stringifyWithTypes } from '../../json'
import { BrowserService } from '../browser.service'
import { SidebarCard } from '../sidebar/types'
import { EntitiesService } from './entities.service'
import { SettingsService } from './settings.service'
import { XRefService } from './x-ref.service'

@Injectable({
  providedIn: 'root'
})
export class EntityMessengerService {
  private isFirstHighlight = true

  constructor(
    private browserService: BrowserService,
    private entitiesService: EntitiesService,
    private settingsService: SettingsService,
    private xRefService: XRefService
  ) {
    this.entitiesService.entityChangeObservable.subscribe(change => {
      if (change.setterInfo === 'noPropagate') {
        return
      }

      this.browserService
        .sendMessageToTab(change.tabID, {
          type: 'content_script_highlight_entities',
          body: stringifyWithTypes(change.entities)
        })
        .then(stringifiedTabEntities => {
          const tabEntities = parseWithTypes(stringifiedTabEntities) as TabEntities
          if (change.setterInfo !== 'isFilteredEntities') {
            // Use 'noPropagate' setter info so that we don't get into an infinite loop.
            this.entitiesService.setTabEntities(change.tabID, tabEntities, 'noPropagate')
            this.entitiesService.setFilteredEntities(change.tabID, tabEntities)
          } else {
            this.entitiesService.setFilteredEntities(change.tabID, tabEntities)
            this.browserService.sendMessageToTab(change.tabID, {
              type: 'sidebar_data_update_cards',
              body: stringifiedTabEntities
            })
          }

          this.openSidebar(change.tabID, tabEntities)
        })
    })

    this.browserService.addListener(msg => {
      switch (msg.type) {
        case 'entity_messenger_service_highlight_clicked':
          return this.highlightClicked(msg.body)
        case 'min_entity_length_changed':
          this.browserService
            .sendMessageToActiveTab('content_script_remove_highlights')
            .then(() => {
              const minEntityLength = msg.body
              this.entitiesService.filterEntities(minEntityLength)

              return Promise.resolve()
            })
        default:
      }
    })
  }

  highlightClicked(elementID: string): Promise<void> {
    const [entityID, entityOccurrence, synonymName, synonymOccurrence] = parseHighlightID(elementID)

    return this.browserService.getActiveTab().then(tab => {
      const entity = this.entitiesService.getFilteredEntity(
        tab.id!,
        this.settingsService.preferences.recogniser,
        entityID
      )
      if (!entity) {
        console.warn(`entity ${entityID} was clicked but does not exist in filtered entities!`)

        return
      }

      const sidebarCard: SidebarCard = {
        recogniser: this.settingsService.preferences.recogniser,
        entity,
        entityID: entityID,
        clickedEntityOccurrence: entityOccurrence,
        clickedSynonymName: synonymName,
        clickedSynonymOccurrence: synonymOccurrence
      }

      const getXrefs: Promise<XRef[]> = entity.xRefs
        ? Promise.resolve(entity.xRefs)
        : this.xRefService.get(entity)

      getXrefs
        .then(xRefs => {
          entity.xRefs = xRefs
        })
        .catch(err => {
          console.warn(err)
          entity.xRefs = []
        })
        .finally(() => {
          this.browserService.sendMessageToTab(tab.id!, {
            type: 'sidebar_data_service_view_or_create_card',
            body: stringifyWithTypes(sidebarCard)
          })
        })
    })
  }

  private openSidebar(tabID: number, entites: TabEntities): void {
    // if sidebar is not initialized, we must wait a short time for the sidebar to initialize before sending data to it
    const sidebarWaitTime = this.isFirstHighlight ? 100 : 0

    this.isFirstHighlight = false

    this.browserService.sendMessageToTab(tabID, 'content_script_open_sidebar').then(() => {
      setTimeout(() => {
        this.browserService.sendMessageToTab(tabID, {
          type: 'sidebar_data_total_count',
          body: { totalCount: this.getCounts(entites), error: '' }
        })
      }, sidebarWaitTime)
    })
  }

  private getCounts(tabEntities: TabEntities): number {
    let count = 0
    if (tabEntities === undefined) {
      console.error('tab entities is undefined')

      return 0
    }
    const tabEntityKeys = Object.keys(tabEntities) as Array<keyof TabEntities>
    tabEntityKeys.forEach(recogniser => {
      const recogniserCount = tabEntities[recogniser]?.entities.size
      count += recogniserCount ?? 0
    })

    return count
  }
}
