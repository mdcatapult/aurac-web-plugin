import {Entity} from './../../content-script/types';
import {Component} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {ConverterResult, defaultSettings, LeadminerEntity, LeadminerResult, Message, Settings, StringMessage, XRef, EntityCache, DictionaryPath} from 'src/types';
import {map, switchMap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {BrowserService} from '../browser.service';
import {saveAs} from 'file-saver';
import {EntityGroupColours} from '../../content-script/types';
import { EntityMessengerService } from './entity-messenger.service';
import { SettingsService } from './settings.service';

@Component({
  selector: 'app-background',
  template: '<app-logger></app-logger>',
})

export class BackgroundComponent {

  dictionary?: DictionaryPath;
  entityCache: EntityCache = new Map()

  constructor (
    private client: HttpClient, 
    private browserService: BrowserService,
    private entityMessengerService: EntityMessengerService,
    private settingsService: SettingsService
  ) {
    this.browserService.addListener(this.getBrowserListenerFn());
  }

  private getBrowserListenerFn(): (msg: Partial<Message>) => void {
    return (msg: Partial<Message>) => {
      switch (msg.type) {
        case 'ner_current_page': {
          this.browserService.sendMessageToActiveTab({type: 'content_script_open_sidebar'})
            .then(() => this.entityMessengerService.setSidebarEntities())
            .catch(console.error)
          // this.dictionary = msg.body;
          // this.browserService.sendMessageToActiveTab({type: 'remove_highlights', body: []})
          //   .then(() => {
          //     this.nerCurrentPage(this.dictionary!);
          //   })
          break;
        }
        case 'compound_x-refs' : {
          this.loadXRefs(msg.body);
          break;
        }
        case 'min-entity-length-changed': {
          this.refreshHighlights(this.dictionary!);
          break;
        }
        case 'export_csv': {
          this.retrieveNERFromPage(this.dictionary!)
          break;
        }
        case 'open_modal': {
          this.openModal(msg.body)
          break;
        }
      }
    }
  }

  private saveURLToEntityMapper(dictionary: DictionaryPath, entities: Array<LeadminerEntity>): void {
    this.browserService.getActiveTab()
      .then(tabResponse => {
        const currentURL = this.sanitiseURL(tabResponse.url!)
        const dictionaryToEntities = this.entityCache.has(currentURL) ?
          this.entityCache.get(currentURL) : new Map<DictionaryPath, Array<LeadminerEntity>>()
        dictionaryToEntities!.set(dictionary, entities)

        this.entityCache.set(currentURL, dictionaryToEntities!)

        const entityCacheToJson = JSON.stringify(this.entityCache, (key: string, value: any) => {
          if (value instanceof Map) {
            return {
              dataType: 'Map',
              value: Array.from(value.entries()),
            };
          } else {
            return value;
          }
        });
        this.browserService.saveEntityCache(entityCacheToJson)
      })
  }

  private refreshHighlights(dictionary: DictionaryPath): void {
    Promise.all([
      this.browserService.getActiveTab(),
      this.browserService.loadEntityCache(),
    ])
      .then(([tabResponse, urlToEntityMap]) => {
        const currentURL = this.sanitiseURL(tabResponse.url!)
        const entities = urlToEntityMap.get(currentURL)!.get(dictionary)!
        if (entities.length === 0) {
          return;
        }
        this.browserService.sendMessageToActiveTab({type: 'remove_highlights', body: []})
          .then(() => {
            const uniqueEntities = this.getUniqueEntities(entities)
            this.browserService.sendMessageToActiveTab({type: 'markup_page', body: uniqueEntities})
              .catch(console.error);
          }
        )
      })
  }

  private openModal(chemblId: string): void {
    this.browserService.sendMessageToActiveTab({type: 'open_modal', body: chemblId})
  }

  private sanitiseURL(url: string): string {
    return url!.replace(/^(https?|http):\/\//, '').split('#')[0]
  }

  private retrieveNERFromPage(dictionary: DictionaryPath): void {
    Promise.all([
      this.browserService.getActiveTab(),
      this.browserService.loadEntityCache()
    ])
      .then(([tabResponse, urlToEntityMap]) => {
        const currentURL = this.sanitiseURL(tabResponse.url!)
        const entities = urlToEntityMap.get(currentURL)!.get(dictionary)!
        this.exportResultsToCSV(this.getUniqueEntities(entities), currentURL)
      })
      .catch(e => console.error(`Error: ' : ${JSON.stringify(e)}`));
  }

  private exportResultsToCSV(currentResults: Array<LeadminerEntity>, currentURL: string): void {
    if (currentResults.length === 0) {
      return;
    }
    const headings = ['beg',
      'begInNormalizedDoc',
      'end',
      'endInNormalizedDoc',
      'entityText',
      'possiblyCorrectedText',
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
    let text = headings.join(',') + '\n'
    currentResults.forEach(entity => {
      text = text + entity.beg + ','
        + entity.begInNormalizedDoc + ','
        + entity.end + ','
        + entity.endInNormalizedDoc + ','
        + `"${entity.entityText}"` + ','
        + entity.possiblyCorrectedText + ','
        + entity.resolvedEntity + ','
        + entity.sectionType + ','
        + entity.entityGroup + ','
        + entity.recognisingDict.enforceBracketing + ','
        + entity.recognisingDict.entityType + ','
        + entity.recognisingDict.htmlColor + ','
        + entity.recognisingDict.maxCorrectionDistance + ','
        + entity.recognisingDict.minimumCorrectedEntityLength + ','
        + entity.recognisingDict.minimumEntityLength + ','
        + entity.recognisingDict.source + '\n'
    })
    this.exportToCSV(text, currentURL)
  }

  private exportToCSV(text: string, currentURL: string): void {
    const blob = new Blob([text], {type: 'text/csv;charset=utf-8'})
    saveAs(blob, 'aurac_all_results_' + currentURL + '.csv')
  }

  private smilesToInChIToUnichemPlus([entityText, smilesText]: [string, string]): Observable<XRef[]> {
    const encodedEntity = encodeURIComponent(smilesText);
    const xRefObservable = this.client.get(`${this.settingsService.APIURLs.compoundConverterURL}/${encodedEntity}?from=SMILES&to=inchikey`).pipe(
      // @ts-ignore
      switchMap((converterResult: ConverterResult) => {
        return converterResult ?
          this.client.post(
            `${this.settingsService.APIURLs.unichemURL}/x-ref/${converterResult.output}`,
            this.getTrueKeys(this.settingsService.xRefSources)
          ) : of({});
      }),
      this.addCompoundNameToXRefObject(entityText)
    );
    return xRefObservable
  }

  private postToUnichemPlus([entityText, inchiKeyText]: [string, string]): Observable<XRef[]> {
    const xRefObservable = this.client.post(
      `${this.settingsService.APIURLs.unichemURL}/x-ref/${inchiKeyText}`,
      this.getTrueKeys(this.settingsService.xRefSources)).pipe(
      // @ts-ignore
      this.addCompoundNameToXRefObject(entityText)
    );
    return xRefObservable
  }

  private loadXRefs([entityText, resolvedEntity, entityGroup, entityType]: [string, string, string, string]): void {
    if (entityGroup !== 'Chemical') {
      return
    }
    let xRefObservable: Observable<XRef[]>;
    switch (entityType) {
      case 'SMILES': {
        xRefObservable = this.smilesToInChIToUnichemPlus([entityText, entityText])
        break
      }
      // likely to be more cases here.
      case 'DictMol':
      case 'Mol': {
        const inchiKeyRegex = /^[a-zA-Z]{14}-[a-zA-Z]{10}-[a-zA-Z]$/;
        if (!resolvedEntity.match(inchiKeyRegex)) {
          xRefObservable = this.smilesToInChIToUnichemPlus([entityText, resolvedEntity])
        } else {
          xRefObservable = this.postToUnichemPlus([entityText, resolvedEntity])
        }
        break
      }
      default: {
        // default case assumes that the entity text is itself an InChiKey.
        xRefObservable = this.postToUnichemPlus([entityText, entityText])
      }
    }
    xRefObservable.subscribe((xrefs: XRef[]) => {
      if (xrefs.length) {
        this.browserService.sendMessageToActiveTab({type: 'x-ref_result', body: xrefs})
          .catch(console.error);
      }
    });
  }

  private addCompoundNameToXRefObject = (entityTerm: string) => map((xrefs: XRef[]) => xrefs.map(xref => {
    if (xref) {
      xref.compoundName = entityTerm;
    }
    return xref;
  }))

  private nerCurrentPage(dictionary: DictionaryPath): void {
    this.browserService.sendMessageToActiveTab({type: 'get_page_contents'})
      .catch(console.error)
      .then(result => {
        if (!result || !result.body) {
          console.error('No content');
          return;
        }
        result = result as StringMessage;
        let queryParams: HttpParams = new HttpParams()
          .set('inchikey', 'false');
        let dictionaryPath: string

        switch (dictionary) {
          case 'chemical-entities':
            queryParams = new HttpParams().set('inchikey', 'true')
          default:
            dictionaryPath = dictionary
        }

        const leadmineURL = `${this.settingsService.APIURLs.leadmineURL}${environment.production ? `/${dictionaryPath}` : ''}/entities`;

        this.client.post<LeadminerResult>(
          leadmineURL,
          result.body,
        {observe: 'response', params: queryParams})
          .subscribe((response) => {
            if (!response.body || !response.body.entities) {
              this.browserService.sendMessageToActiveTab({type: 'awaiting_response', body: false})
                .catch(console.error);
              return;
            }
            const leadminerResult = response.body;
            this.saveURLToEntityMapper(dictionary, leadminerResult.entities!)
            const uniqueEntitiesWithAmendedHtmlColour =
              this.getUniqueEntities(leadminerResult.entities!).map(this.amendEntityHtmlColor);

            this.browserService.sendMessageToActiveTab({type: 'markup_page', body: uniqueEntitiesWithAmendedHtmlColour})
              .catch(console.error);
            },
            () => {
              this.browserService.sendMessageToActiveTab({type: 'awaiting_response', body: false})
                .catch(console.error);
            });

        this.browserService.sendMessageToActiveTab({type: 'awaiting_response', body: true})
          .catch(console.error);
      });
  }

  shouldDisplayEntity(entity: LeadminerEntity): boolean {
    // Entity length must be at least minimum entity length.
    return (entity && entity.entityText.length >= this.settingsService.preferences.minEntityLength);
  }

  getUniqueEntities(leadmineResponse: LeadminerEntity[]): LeadminerEntity[] {
    const uniqueEntities: LeadminerEntity[] = [];
    leadmineResponse.forEach((entity: LeadminerEntity) => {
        if (this.shouldDisplayEntity(entity)) {
          if (!uniqueEntities.some(uniqueEntity => uniqueEntity.entityText === entity.entityText)) {
            uniqueEntities.push(entity);
          }
        }
      });
    return uniqueEntities;
  }

  /**
   * Use the entity's entity group to amend the html colour returned from Leadmine.
   * If we don't have a matching key in the EntityGroupColours object, leave the htmlColor unchanged
   */
  amendEntityHtmlColor(entity: LeadminerEntity): LeadminerEntity {
    let newColor = EntityGroupColours[entity.entityGroup]
    if (newColor != null) {
      entity.recognisingDict.htmlColor = newColor
    }

    return entity;
  }

  private getTrueKeys(v: { [_: string]: boolean }): string[] {
    return Object.keys(v).filter(k => v[k] === true);
  }
}
