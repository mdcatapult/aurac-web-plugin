import {Component} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {SettingsService} from '../settings/settings.service'

import {
  ConverterResult,
  defaultSettings,
  DictionaryURLs,
  LeadminerEntity,
  LeadminerResult,
  Message, Preferences,
  Settings,
  StringMessage,
  XRef
} from 'src/types';
import {validDict} from './types';
import {map, switchMap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {BrowserService} from '../browser.service';

@Component({
  selector: 'app-background',
  template: '<app-logger></app-logger>',
})

export class BackgroundComponent {

  settings: Settings = defaultSettings;
  dictionary?: validDict;
  leadmineResult?: LeadminerResult;

  constructor(private client: HttpClient, private browserService: BrowserService) {

    SettingsService.loadSettings(this.browserService, () => {
      this.browserService.addListener(this.getBrowserListenerFn())
    })
  }

  private getBrowserListenerFn(): (msg: Partial<Message>) => void {
    return (msg: Partial<Message>) => {
      console.log('Received message from popup...', msg);
      switch (msg.type) {
        case 'ner_current_page': {
          this.dictionary = msg.body;
          this.nerCurrentPage(this.dictionary!);
          break;
        }
        case 'compound_x-refs' : {
          this.loadXRefs(msg.body);
          break;
        }
        case 'settings-changed': {
          const minEntityLengthChanged = this.settings.preferences.minEntityLength !== (msg.body as Settings).preferences.minEntityLength;
          this.settings = msg.body;
          if (minEntityLengthChanged) {
            this.browserService.sendMessageToActiveTab({type: 'remove_highlights', body: []})
              .catch(e => console.error(e))
              .then(() => {
                if (this.leadmineResult) {
                  this.getUniqueEntities(this.leadmineResult);
                }
              });
          }
          break;
        }
      }
    }
  }

  private loadXRefs([entityTerm, resolvedEntity]: [string, string]): void {
    const inchiKeyRegex = /^[a-zA-Z]{14}-[a-zA-Z]{10}-[a-zA-Z]$/;
    let xRefObservable: Observable<XRef[]>;
    if (resolvedEntity) {
      if (!resolvedEntity.match(inchiKeyRegex)) {
        const encodedEntity = encodeURIComponent(resolvedEntity);
        xRefObservable = this.client.get(`${this.settings.urls.compoundConverterURL}/${encodedEntity}?from=SMILES&to=inchikey`).pipe(
          // @ts-ignore
          switchMap((converterResult: ConverterResult) => {
            return converterResult ?
              this.client.post(
                `${this.settings.urls.unichemURL}/x-ref/${converterResult.output}`,
                this.getTrueKeys(this.settings.xRefConfig)
              ) : of({});
          }),
          this.addCompoundNameToXRefObject(entityTerm)
        );
      } else {
        xRefObservable = this.client.post(
          `${this.settings.urls.unichemURL}/x-ref/${resolvedEntity}`,
          this.getTrueKeys(this.settings.xRefConfig)
        ).pipe(
          // @ts-ignore
          this.addCompoundNameToXRefObject(entityTerm)
        );
      }

      xRefObservable.subscribe((xrefs: XRef[]) => {
        this.browserService.sendMessageToActiveTab({type: 'x-ref_result', body: xrefs})
          .catch(e => console.error(e));
      });
    }
  }


  private addCompoundNameToXRefObject = (entityTerm: string) => map((xrefs: XRef[]) => xrefs.map(xref => {
    if (xref) {
      xref.compoundName = entityTerm;
    }
    return xref;
  }));


  private nerCurrentPage(dictionary: validDict): void {
    console.log('Getting content of active tab...');
    this.browserService.sendMessageToActiveTab({type: 'get_page_contents'})
      .catch(e => console.error(e))
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
            if (!response.body) {
              return;
            }
            this.leadmineResult = response.body;
            this.getUniqueEntities(this.leadmineResult!);

          });
      });
  }

  getUniqueEntities(leadmineResponse: LeadminerResult): void {
    const uniqueEntities = new Array<LeadminerEntity>();
    leadmineResponse.entities.filter(entity => {
      return entity.resolvedEntity && entity.entityText.length >= this.settings.preferences.minEntityLength;
    })
      .forEach((entity: LeadminerEntity) => {
        if (uniqueEntities.every(uniqueEntity => uniqueEntity.entityText !== entity.entityText)) {
          uniqueEntities.push(entity);
        }
      });
    // return uniqueEntities;
    this.browserService.sendMessageToActiveTab({type: 'markup_page', body: uniqueEntities})
      .catch(e => console.error(e));
  }

  private getTrueKeys(v: { [_: string]: boolean }): string[] {
    return Object.keys(v).filter(k => v[k] === true);
  }
}
