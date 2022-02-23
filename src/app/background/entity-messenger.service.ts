import { Injectable } from '@angular/core'
import { TabEntities, XRef } from 'src/types/entity'
import { parseHighlightID } from 'src/types/highlights'
import { parseWithTypes, stringifyWithTypes } from '../../json'
import { BrowserService } from '../browser.service'
import { SidebarCard } from '../sidebar/types'
import { EntitiesService } from './entities.service'
import { SettingsService } from './settings.service'
import { XRefService } from './x-ref.service'
import { LinksService } from '../sidebar/links.service'
import { HttpClient } from '@angular/common/http'
import MessageSender = browser.runtime.MessageSender
import { Message } from '../../types/messages'

@Injectable({
  providedIn: 'root'
})
export class EntityMessengerService {
  //When someone makes a request to the pdf js service. We'll keep track of the tab the user was on so we know which page
  // we need to turn off the loading icon when the request is complete
  pdfRequestTabID: number = 0

  constructor(
    private browserService: BrowserService,
    private entitiesService: EntitiesService,
    private settingsService: SettingsService,
    private xRefService: XRefService,
    private linksService: LinksService,
    private http: HttpClient
  ) {
    this.entitiesService.entityChangeObservable.subscribe(change => {
      if (change.setterInfo === 'noPropagate') {
        return
      }
      this.browserService
        .sendMessageToTab(change.tabID, {
          type: 'content_script_highlight_entities',
          body: {
            entities: stringifyWithTypes(change.entities),
            recogniser: this.settingsService.preferences.recogniser
          }
        })
        .then((result: { tabEntities: string; entityCount: number }) => {
          const stringifiedTabEntities = result.tabEntities
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

          this.openSidebar(change.tabID, result.entityCount)
        })
    })

    this.browserService.addListener(
      // We need to use sendResponse to return data back to the sender, currently Promise.resolve only works for chrome and
      // not FF, potentially due to polyfill issues. To work around this, we instead return sendResponse which does work but is
      // deprecated, see https://github.com/mozilla/webextension-polyfill/issues/172#issuecomment-457286111
      (msg, listener: MessageSender, sendResponse: (response: any) => {}) => {
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
            break
          case 'entity_messenger_service_convert_pdf':
            this.convertPDF(msg)
            break
          case 'entity_messenger_service_is_page_compressed':
            const isPageCompressed = this.browserService.sendMessageToActiveTab({
              type: 'content_script_is_page_compressed',
              body: msg.body as boolean
            })
            isPageCompressed.then(result => {
              sendResponse(result)
            })
            return true
          case 'entity_messenger_service_scroll_to_highlight':
            this.browserService.sendMessageToActiveTab({
              type: 'content_script_scroll_to_highlight',
              body: msg.body
            })
            break
          case 'entity_messenger_service_get_active_tab':
            const activeTab = this.browserService.getActiveTab()
            activeTab.then(result => {
              sendResponse(result)
            })
            return true
          default:
        }
      }
    )
  }

  convertPDF(msg: Partial<Message>) {
    this.pdfRequestTabID = msg.body.id
    this.http
      .get(msg.body.pdfURL, { params: { url: msg.body.param }, responseType: 'text' })
      .subscribe(
        () => {
          browser.tabs
            .create({ url: `${msg.body.pdfURL}/?url=${msg.body.param}` })
            .then(() => {
              this.browserService.sendMessageToTab(
                this.pdfRequestTabID,
                'content_script_close_loading_icon'
              )
            })
            .catch(error =>
              console.error("could not send message 'content_script_close_loading_icon'", error)
            )
        },
        err => {
          console.log(err.error)
        }
      )
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
          sidebarCard.entity.links = this.linksService.getLinks(sidebarCard)
          this.browserService.sendMessageToTab(tab.id!, {
            type: 'sidebar_data_service_view_or_create_card',
            body: stringifyWithTypes(sidebarCard)
          })
        })
    })
  }

  private openSidebar(tabID: number, entityCount: number): void {
    // if sidebar is not initialized, we must wait a short time for the sidebar to initialize before sending data to it
    const sidebarWaitTime = 250

    this.browserService.sendMessageToTab(tabID, 'content_script_open_sidebar').then(() => {
      setTimeout(() => {
        this.browserService.sendMessageToTab(tabID, {
          type: 'sidebar_data_total_count',
          body: entityCount
        })
      }, sidebarWaitTime)
    })
  }
}
