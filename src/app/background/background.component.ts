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
  StringMessage, Settings
} from 'src/types';
import {validDict} from './types';
import {map, switchMap} from 'rxjs/operators';
import {of} from 'rxjs';
import {LogService} from '../popup/log.service';

@Component({
  selector: 'app-background',
  template: '<app-logger></app-logger>',
})

export class BackgroundComponent {

  settings?: Settings;

  constructor(private client: HttpClient) {
    browser.runtime.onMessage.addListener((msg) => {
      switch (msg.type) {
        case 'ner_current_page': {
          console.log('Received message from popup...');
          this.nerCurrentPage(msg.body);
          break;
        }
        case 'compound_x-refs' : {
          this.loadXRefs(msg.body);
          break;
        }
        case 'settings' : {
          this.settings = msg.body;
        }
      }
    });
  }

  private loadXRefs(entityTerm: string): void {

    const leadmineURL = `${this.settings.leadmineURL}/${entityTerm}`;

    this.client.get(leadmineURL).pipe(
      switchMap((leadmineResult: LeadmineResult) => {
          const smiles = leadmineResult ? leadmineResult.entities[0].resolvedEntity : undefined;
          return smiles ? this.client.get(`${this.settings.compoundConverterURL}/${smiles}?from=SMILES&to=inchikey`) : of({});
        }
      ),
      switchMap((converterResult: ConverterResult) => this.client.get(`${this.settings.unichemURL}/${converterResult.output}`)),
      map((xrefs: XRef[]) => xrefs.map(xref => {
        xref.compoundName = entityTerm;
        return xref;
      }))
    ).subscribe((xrefs: XRef[]) => {
      browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT}).then(tabs => {
        const tab = tabs[0].id;
        browser.tabs.sendMessage<XRefMessage>(tab, {type: 'x-ref_result', body: xrefs});
      });
    });
  }

  private nerCurrentPage(dictionary: validDict): void {
    console.log('Getting content of active tab...');
    let tab;
    browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT}).then(tabs => {
      tab = tabs[0].id;
      browser.tabs.sendMessage<Message, StringMessage>(tab, {type: 'get_page_contents'})
      .catch(e => console.error(e))
      .then(result => {
        result = result as StringMessage;
        console.log('Sending page contents to leadmine...');
        this.client.post<LeadminerResult>(`https://leadmine.wopr.inf.mdc/${dictionary}/entities`, result.body, {observe: 'response'})
          .subscribe((response) => {
            console.log('Received results from leadmine...');
            const uniqueEntities = this.getUniqueEntities(response.body);
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
