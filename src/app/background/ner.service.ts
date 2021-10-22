import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DictionaryEntities, Entity, LeadminerEntity, LeadminerResult } from 'src/types';
import { BrowserService } from '../browser.service';
import { EntitiesService } from './entities.service';
import { SettingsService } from './settings.service';

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
    this.browserService.addListener((msg) => {
      switch (msg.type) {
        case 'ner_service_process_current_page':
          this.processCurrentPage()
      }
    })
  }

  private processCurrentPage(): void {
    this.browserService.getActiveTab().then(tab => {
      this.openLoadingIcon(tab.id!)
      .then(() => this.getPageContents(tab.id!), e => {throw e})
      .then(contents => this.callLeadmine(contents), error => this.handleLeadmineError(tab.id!, error))
      .then(leadminerResult => {
        const dictionaryEntities = this.transformLeadminerResult(leadminerResult as LeadminerResult)
        this.entitiesService.setDictionaryEntities({tab: tab.id!, dictionary: this.settingsService.preferences.dictionary}, dictionaryEntities)
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

  private callLeadmine(body: string): Promise<LeadminerResult | void> {
    const [url, params] = this.constructLeadmineURL()
    return this.httpClient.post<LeadminerResult>(url, body, {observe: 'response', params})
      .toPromise()
      .then(response => {
        if (!response?.body?.entities) {
          throw new Error("leadmine response has no entities")
        }
        return response.body!
      })
  }

  private handleLeadmineError(tabId: number, error: Error) {
    this.closeLoadingIcon(tabId)
    throw error
  }

  private constructLeadmineURL(): [string, HttpParams] {
    const params = new HttpParams()
    this.settingsService.preferences.dictionary === 'chemical-entities'
      ? params.set('inchikey', 'true')
      : params.set('inchikey', 'false')

    return [`${this.settingsService.APIURLs.leadmineURL}${environment.production ? `/${this.settingsService.preferences.dictionary}` : ''}/entities`, params];
  }

  private transformLeadminerResult(leadminerResult: LeadminerResult): DictionaryEntities {
    console.log(leadminerResult)
    let dictionaryEntities: DictionaryEntities = {
      show: true,
      entities: new Map<string,Entity>()
    }

    const set = (key: string, entity: LeadminerEntity) => {
      dictionaryEntities.entities.set(key, {
        synonyms: new Set([entity.entityText]),
        occurrences: [],
        metadata: {
          recognisingDict: entity.recognisingDict,
          entityGroup: entity.entityGroup
        }
      })
    }

    leadminerResult.entities.forEach(leadmineEntity => {
      if (leadmineEntity.resolvedEntity) {
        if (dictionaryEntities.entities.has(leadmineEntity.resolvedEntity)) {
          const entity = dictionaryEntities.entities.get(leadmineEntity.resolvedEntity)
          entity!.synonyms.add(leadmineEntity.entityText)
        } else {
          set(leadmineEntity.resolvedEntity, leadmineEntity)
        }
      } else {
        set(leadmineEntity.entityText, leadmineEntity)
      }
    })

    return dictionaryEntities
  }
}
