import {Component} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {
  LeadmineMessage,
  LeadminerEntity,
  LeadmineResult,
  LeadminerResult,
  ConverterResult,
  XRef,
  XRefMessage,
  Message,
  StringMessage, Settings, defaultSettings
} from 'src/types';
import {validDict} from './types';
import {map, switchMap} from 'rxjs/operators';
import {of} from 'rxjs';

@Component({
  selector: 'app-background',
  template: '<app-logger></app-logger>',
})

export class BackgroundComponent {

  settings: Settings = defaultSettings;
  dictionary?: validDict;

  constructor(private client: HttpClient) {
    browser.runtime.onMessage.addListener((msg: any) => {
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
          return Promise.resolve(this.settings);
        }
      }
    });
  }

  private loadXRefs(entityTerm: string): void {

    const leadmineURL = `${this.settings.leadmineURL}/${this.dictionary}/entities/${entityTerm}`;

    this.client.get(leadmineURL).pipe(
      // @ts-ignore
      switchMap((leadmineResult: LeadmineResult) => {
          const smiles = leadmineResult ? leadmineResult.entities[0].resolvedEntity : undefined;
          return smiles ? this.client.get(`${this.settings.compoundConverterURL}/${smiles}?from=SMILES&to=inchikey`) : of({});
        }
      ),
      switchMap((converterResult: ConverterResult) => {
        return converterResult ? this.client.get(`${this.settings.unichemURL}/${converterResult.output}`) : of({});
      }),
      map((xrefs: XRef[]) => xrefs.map(xref => {
        if (xref) {
          xref.compoundName = entityTerm;
        }
        return xref;
      }))
    ).subscribe((xrefs: XRef[]) => {
      browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT}).then(tabs => {
        const tab = tabs[0].id!;
        browser.tabs.sendMessage<XRefMessage>(tab, {type: 'x-ref_result', body: xrefs});
      });
    });
  }

  private nerCurrentPage(dictionary: validDict): void {
    console.log('Getting content of active tab...');
    browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT}).then(tabs => {
      const tab = tabs[0].id!;
      browser.tabs.sendMessage<Message, StringMessage>(tab, {type: 'get_page_contents'})
      .catch(e => console.error(e))
      .then(result => {
        if (!result || !result.body) {
          console.log('No content');
          return;
        }
        result = result as StringMessage;
        console.log('Sending page contents to leadmine...');
        this.client.post<LeadminerResult>(`${this.settings.leadmineURL}/${dictionary}/entities`, result.body, {observe: 'response'})
          .subscribe((response) => {
            console.log('Received results from leadmine...');
            if (!response.body) {
              return;
            }
            const uniqueEntities = this.getUniqueEntities(response.body!);
            browser.tabs.sendMessage<LeadmineMessage>(tab, {type: 'markup_page', body: uniqueEntities});
          });
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
