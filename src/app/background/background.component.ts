import {Component} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {
  ConverterResult,
  defaultSettings,
  LeadminerEntity,
  LeadminerResult,
  Message,
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

    this.browserService.loadSettings().then(settings => {
      this.settings = settings || defaultSettings;
    });

    this.browserService.addListener((msg: Partial<Message>) => {
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
          const preferencesChanged = this.settings.preferences !== (msg.body as Settings).preferences;
          this.settings = msg.body;
          if (preferencesChanged) {
            this.browserService.sendMessageToActiveTab({type: 'remove_highlights', body: []})
              .catch(e => console.error(e))
              .then(() => {
                if (this.leadmineResult) {
                  const uniqueEntities = this.getUniqueEntities(this.leadmineResult);
                  this.browserService.sendMessageToActiveTab({type: 'markup_page', body: uniqueEntities})
                    .catch(e => console.error(e));
                }
              });
          }
          break;
        }
      }
    });
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
            const uniqueEntities = this.getUniqueEntities(this.leadmineResult!);
            this.browserService.sendMessageToActiveTab({type: 'markup_page', body: uniqueEntities})
              .catch(e => console.error(e));
          });
      });
  }

  shouldDisplayEntity(entity: LeadminerEntity): boolean {
    // Entity must be greater than min entity length in all cases.
    if (entity && entity.entityText.length < this.settings.preferences.minEntityLength) {
      return false;
    }
    // If hide unresolved is true, the resolved entity string must be non-empty.
    return this.settings.preferences.hideUnresolved && !!entity.resolvedEntity;
  }


  getUniqueEntities(leadmineResponse: LeadminerResult): Array<LeadminerEntity> {
    const uniqueEntities = new Array<LeadminerEntity>();
    leadmineResponse.entities
      .forEach((entity: LeadminerEntity) => {
        if (this.shouldDisplayEntity(entity)) {
          uniqueEntities.push(entity);
        }
      });
    return uniqueEntities;
  }

  private getTrueKeys(v: { [_: string]: boolean }): string[] {
    return Object.keys(v).filter(k => v[k] === true);
  }
}
