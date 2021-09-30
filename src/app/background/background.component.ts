import {Entity} from './../../content-script/types';
import {Component} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {SettingsService} from '../settings/settings.service';

import {ConverterResult, defaultSettings, LeadminerEntity, LeadminerResult, Message, Settings, StringMessage, XRef, LeadmineMessage} from 'src/types';
import {validDict} from './types';
import {map, switchMap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {BrowserService} from '../browser.service';
import {saveAs} from 'file-saver';

export type MyMap = Map<string, Map<string, Array<LeadminerEntity>>>;


@Component({
  selector: 'app-background',
  template: '<app-logger></app-logger>',
})

export class BackgroundComponent {

  settings: Settings = defaultSettings;
  dictionary?: validDict;
  leadmineResult?: LeadminerResult;
  private currentURL?: string
  URLToEntityMapper: MyMap = new Map()

  constructor(private client: HttpClient, private browserService: BrowserService) {

    SettingsService.loadSettings(this.browserService, (settings) => {
      this.settings = settings || defaultSettings;
      this.browserService.addListener(this.getBrowserListenerFn());
    });
  }

  private getBrowserListenerFn(): (msg: Partial<Message>) => void {
    return (msg: Partial<Message>) => {
      console.log('Received message from popup...', msg);
      switch (msg.type) {
        case 'ner_current_page': {
          this.dictionary = msg.body;
          this.browserService.sendMessageToActiveTab({type: 'remove_highlights', body: []})
            .then(() => {
              this.nerCurrentPage(this.dictionary!);

            })
          break;
        }
        case 'compound_x-refs' : {
          this.loadXRefs(msg.body);
          break;
        }
        case 'settings-changed': {
          this.settings = msg.body;
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

  private saveURLToEntityMapper(dictionary: validDict, entities: Array<LeadminerEntity>) {
    this.browserService.getActiveTab()
      .then(tabResponse => {
        const currentURL = this.sanitiseURL(tabResponse.url!)
        const dictionaryToEntities = this.URLToEntityMapper.has(currentURL) ?
          this.URLToEntityMapper.get(currentURL) : new Map<string, Array<LeadminerEntity>>()
        dictionaryToEntities!.set(dictionary, entities)

        this.URLToEntityMapper.set(currentURL, dictionaryToEntities!)

        const jsonValue = JSON.stringify(this.URLToEntityMapper, (key: string, value: any) => {
          if (value instanceof Map) {
            return {
              dataType: 'Map',
              value: Array.from(value.entries()),
            };
          } else {
            return value;
          }
        });
        this.browserService.saveURLToEntityMapper(jsonValue)
      })
  }

  private refreshHighlights(dictionary: validDict): void {
    //We don't want to refresh the highlight on a page that hasn't had NER ran on it.
    Promise.all([
      this.browserService.getActiveTab(),
      this.browserService.loadURLToEntityMapper(),
    ])
      .then(([tabResponse, urlToEntityMap]) => {
        const currentURL = this.sanitiseURL(tabResponse.url!)
        const AllEntities = urlToEntityMap.get(currentURL)!.get(dictionary)!

        if (AllEntities.length === 0) {
          return;
        }
        this.browserService.sendMessageToActiveTab({type: 'remove_highlights', body: []})
          .then(() => {
            const uniqueEntities = this.getUniqueEntities(AllEntities)
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

  private retrieveNERFromPage(dictionary: validDict): void {
    Promise.all([this.browserService.getActiveTab(), this.browserService.loadURLToEntityMapper()])
      .then(([tabResponse, urlToEntityMap]) => {
        const currentURL = this.sanitiseURL(tabResponse.url!)
        const AllEntities = urlToEntityMap.get(currentURL)!.get(dictionary)!

        console.log(this.getUniqueEntities(AllEntities))
        this.exportResultsToCSV(this.getUniqueEntities(AllEntities))

      })
      .catch(e => console.error(`Error: ' : ${JSON.stringify(e)}`));
  }

  private exportResultsToCSV(currentResults: Array<LeadminerEntity>): void {
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
    this.exportToCSV(text)
  }

  private exportToCSV(text: string) {
    const blob = new Blob([text], {type: 'text/csv;charset=utf-8'})
    saveAs(blob, 'aurac_all_results_' + this.currentURL + '.csv')
  }

  private smilesToInChIToUnichemPlus([entityText, smilesText]: [string, string]): Observable<XRef[]> {
    const encodedEntity = encodeURIComponent(smilesText);
    const xRefObservable = this.client.get(`${this.settings.urls.compoundConverterURL}/${encodedEntity}?from=SMILES&to=inchikey`).pipe(
      // @ts-ignore
      switchMap((converterResult: ConverterResult) => {
        return converterResult ?
          this.client.post(
            `${this.settings.urls.unichemURL}/x-ref/${converterResult.output}`,
            this.getTrueKeys(this.settings.xRefConfig)
          ) : of({});
      }),
      this.addCompoundNameToXRefObject(entityText)
    );
    return xRefObservable
  }

  private postToUnichemPlus([entityText, inchiKeyText]: [string, string]): Observable<XRef[]> {
    const xRefObservable = this.client.post(
      `${this.settings.urls.unichemURL}/x-ref/${inchiKeyText}`,
      this.getTrueKeys(this.settings.xRefConfig)).pipe(
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
      case 'Mol':   {
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

  private nerCurrentPage(dictionary: validDict): void {
    console.log('Getting content of active tab...');
    this.browserService.sendMessageToActiveTab({type: 'get_page_contents'})
      .catch(console.error)
      .then(result => {
        if (!result || !result.body) {
          console.log('No content');
          return;
        }
        result = result as StringMessage;
        console.log('Sending page contents to leadmine...');
        let queryParams: HttpParams = new HttpParams()
          .set('inchikey', 'false');
        if (dictionary === 'chemical-inchi') {
          dictionary = 'chemical-entities';
          queryParams = new HttpParams().set('inchikey', 'true');
        }
        const leadmineURL = `${this.settings.urls.leadmineURL}${environment.production ? `/${dictionary}` : ''}/entities`;

        this.client.post<LeadminerResult>(
          leadmineURL,
          result.body,
          {observe: 'response', params: queryParams})
          .subscribe((response) => {
            console.log('Received results from leadmine...');
            if (!response.body || !response.body.entities) {
              this.browserService.sendMessageToActiveTab({type: 'awaiting_response', body: false})
                .catch(console.error);
              return;
            }
            const leadminerResult = response.body;
            const uniqueEntities = this.getUniqueEntities(leadminerResult.entities);


            this.saveURLToEntityMapper(dictionary, leadminerResult.entities!)

            this.browserService.sendMessageToActiveTab({type: 'markup_page', body: uniqueEntities})
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
    return (entity && entity.entityText.length >= this.settings.preferences.minEntityLength);
  }


  getUniqueEntities(leadmineResponse: LeadminerEntity[]): Array<LeadminerEntity> {
    const uniqueEntities = new Array<LeadminerEntity>();
    leadmineResponse
      .forEach((entity: LeadminerEntity) => {
        if (this.shouldDisplayEntity(entity)) {
          uniqueEntities.push(entity);
        }
      });
    return uniqueEntities;
  }

  private getTrueKeys(v: {[_: string]: boolean}): string[] {
    return Object.keys(v).filter(k => v[k] === true);
  }
}
