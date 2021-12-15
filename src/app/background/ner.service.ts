import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { RecogniserEntities, Entity } from 'src/types/entity'
import { Recogniser } from 'src/types/recognisers'
import { BrowserService } from '../browser.service'
import { EntitiesService } from './entities.service'
import { SettingsService } from './settings.service'

export type APIEntity = {
  name: string
  position: number
  xpath: string
  recogniser: Recogniser
  identifiers?: any
  metadata?: string
}

export type APIEntities = APIEntity[]

@Injectable({
  providedIn: 'root'
})
export class NerService {
  constructor(
    private httpClient: HttpClient,
    private browserService: BrowserService,
    private settingsService: SettingsService,
    private entitiesService: EntitiesService
  ) {
    this.browserService.addListener(msg => {
      switch (msg.type) {
        case 'ner_service_process_current_page':
          this.processCurrentPage()
      }
    })
  }

  private processCurrentPage(): void {
    this.browserService.getActiveTab().then(tab => {
      this.openLoadingIcon(tab.id!)
        .then(
          () => this.getPageContents(tab.id!),
          e => {
            throw e
          }
        )
        .then(
          contents => this.callAPI(contents),
          error => this.handleAPIError(tab.id!, error)
        )
        .then(response => {
          const recogniserEntities = this.transformAPIResponse(response as APIEntities)
          this.entitiesService.setRecogniserEntities(
            tab.id!,
            this.settingsService.preferences.recogniser,
            recogniserEntities
          )
        })
    })
  }

  private openLoadingIcon(tab: number): Promise<void> {
    return this.browserService.sendMessageToTab(tab, 'content_script_open_loading_icon')
  }

  private closeLoadingIcon(tab: number): Promise<void> {
    return this.browserService.sendMessageToTab(tab, 'content_script_close_loading_icon')
  }

  private getPageContents(tab: number): Promise<string> {
    return this.browserService.sendMessageToTab(tab, 'content_script_get_page_contents')
  }

  private callAPI(body: string): Promise<APIEntities | void> {
    const [params, headers] = this.constructRequestParametersAndHeaders(
      this.settingsService.preferences.recogniser
    )

    return this.httpClient
      .post<APIEntities>(`${this.settingsService.APIURLs.nerURL}/entities`, body, {
        observe: 'response',
        params,
        headers
      })
      .toPromise()
      .then(response => {
        if (response?.status !== 200) {
          throw new Error('api request failed')
        }

        if (!response?.body) {
          throw new Error('api response has no contents')
        }

        return response.body!
      })
      .catch(() => {
        browser.runtime.sendMessage('popup_error')
        this.browserService.getActiveTab().then(tabID => this.closeLoadingIcon(tabID.id!))
      })
  }

  private handleAPIError(tabId: number, error: Error) {
    console.log('in handleAPIError')
    this.closeLoadingIcon(tabId)
    throw error
  }

  private constructRequestParametersAndHeaders(recogniser: Recogniser): [HttpParams, HttpHeaders] {
    // HttpParams.set returns a copy but the original is unmodified - so be careful!
    const params = new HttpParams().set('recogniser', recogniser)

    let headers = new HttpHeaders().set('content-type', 'text/html')
    if (recogniser === 'leadmine-chemical-entities') {
      // Recognition API expects a base64 encoded, json encoded "RecogniserOptions" object.
      // Currently there is only one key "queryParameters", which tells the api how to
      // construct a url when forwarding a request. This key takes a Map<string,string[]>
      // in order to allow multiple values per key.
      const leadmineRecogniserOptions = { queryParameters: { inchikey: ['true'] } }
      const leadmineRecogniserOptionsJSON = JSON.stringify(leadmineRecogniserOptions)
      const base64leadmineRecogniserOptionsJSON = btoa(leadmineRecogniserOptionsJSON)

      headers = headers.set('x-leadmine-chemical-entities', base64leadmineRecogniserOptionsJSON)
    }

    return [params, headers]
  }

  private entityFromAPIEntity(recognisedEntity: APIEntity): Entity {
    const entity: Entity = {
      synonymToXPaths: new Map([[recognisedEntity.name, [recognisedEntity.xpath]]])
    }

    if (recognisedEntity.metadata) {
      // API returns metadata as a base64 encoded json blob (because grpc has problems dealing with "any").
      // Convert it and parse it to get something useful.
      entity.metadata = JSON.parse(atob(recognisedEntity.metadata!))
    }

    if (recognisedEntity.identifiers) {
      entity.identifierSourceToID = new Map<string, string>(
        Object.entries(recognisedEntity.identifiers)
      )
    }

    return entity
  }

  private setOrUpdateEntity(
    recogniserEntities: RecogniserEntities,
    key: string,
    recognisedEntity: APIEntity
  ): void {
    const entity = recogniserEntities.entities.get(key)
    if (entity) {
      const xpaths = entity.synonymToXPaths.get(recognisedEntity.name)
      if (xpaths) {
        xpaths.push(recognisedEntity.xpath)
      } else {
        entity.synonymToXPaths.set(recognisedEntity.name, [recognisedEntity.xpath])
      }
    } else {
      recogniserEntities.entities.set(key, this.entityFromAPIEntity(recognisedEntity))
    }
  }

  private transformAPIResponse(response: APIEntities): RecogniserEntities {
    let recogniserEntities: RecogniserEntities = {
      show: true,
      entities: new Map<string, Entity>()
    }

    response.forEach(recognisedEntity => {
      switch (recognisedEntity.recogniser) {
        case 'leadmine-chemical-entities':
        case 'leadmine-disease':
        case 'leadmine-proteins':
          // For all leadmine dictionaries, we will use the resolved entity
          // to determine whether two entities are synonyms of each other.
          const resolvedEntity: string = recognisedEntity.identifiers?.resolvedEntity

          if (resolvedEntity) {
            this.setOrUpdateEntity(recogniserEntities, resolvedEntity, recognisedEntity)
          } else {
            // If there is no resolved entity, just use the entity text (lowercased) to determine synonyms.
            // (This means the synonyms will be identical except for their casing).
            this.setOrUpdateEntity(
              recogniserEntities,
              recognisedEntity.name.toLowerCase(),
              recognisedEntity
            )
          }

          break
      }
    })

    return recogniserEntities
  }
}
