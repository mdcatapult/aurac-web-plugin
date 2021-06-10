import {Component} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {
  ConverterResult,
  defaultSettings,
  DictionaryURLs,
  LeadminerEntity,
  LeadminerResult,
  Message,
  StringMessage,
  XRef
} from 'src/types';
import {validDict} from './types';
import {map, switchMap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {BrowserService} from '../browser.service';
import MessageSender = browser.runtime.MessageSender;

@Component({
  selector: 'app-background',
  template: '<app-logger></app-logger>',
})

export class BackgroundComponent {

  settings: DictionaryURLs = defaultSettings;
  dictionary?: validDict;

  constructor(private client: HttpClient, private browserService: BrowserService) {
    this.browserService.addListener((msg: Partial<Message>, listener: MessageSender,
                                     sendResponse: (response: object) => {}) => {
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
        case 'save-settings' : {
          this.settings = msg.body;
          break;
        }
        case 'load-settings': {
          sendResponse(this.settings);
        }
      }
    });
  }

  private loadXRefs([entityTerm, resolvedEntity]: [string, string]): void {
    const inchiKeyRegex = /^[a-zA-Z]{14}-[a-zA-Z]{10}-[a-zA-Z]{1}$/;
    let xRefObservable: Observable<XRef[]>;
    if (resolvedEntity) {
      if (!resolvedEntity.match(inchiKeyRegex)) {
        const encodedEntity = encodeURIComponent(resolvedEntity);
        xRefObservable = this.client.get(`${this.settings.compoundConverterURL}/${encodedEntity}?from=SMILES&to=inchikey`).pipe(
          // @ts-ignore
          switchMap((converterResult: ConverterResult) => {
            return converterResult ? this.client.get(`${this.settings.unichemURL}/${converterResult.output}`) : of({});
          }),
          this.addCompoundNameToXRefObject(entityTerm)
        );
      } else {
        xRefObservable = this.client.get(`${this.settings.unichemURL}/${resolvedEntity}`).pipe(
          // @ts-ignore
          this.addCompoundNameToXRefObject(entityTerm)
        );
      }

      xRefObservable.subscribe((xrefs: XRef[]) => {
        this.browserService.sendMessageToActiveTab({type: 'x-ref_result', body: xrefs});
        });
      }
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
          this.client.post<LeadminerResult>(
            `${this.settings.leadmineURL}/${dictionary}/entities`,
            result.body,
            {observe: 'response', params: queryParams})
            .subscribe((response) => {
              console.log('Received results from leadmine...');
              if (!response.body) {
                return;
              }
              const uniqueEntities = this.getUniqueEntities(response.body!);
              this.browserService.sendMessageToActiveTab({type: 'markup_page', body: uniqueEntities});
            });
        });
  }

  getUniqueEntities(leadmineResponse: LeadminerResult): Array<LeadminerEntity> {
    const uniqueEntities = new Array<LeadminerEntity>();
    leadmineResponse.entities.forEach((entity: LeadminerEntity) => {
      if (uniqueEntities.every(uniqueEntity => uniqueEntity.entityText !== entity.entityText)) {
        uniqueEntities.push(entity);
      }
    });
    return uniqueEntities;
  }
}
