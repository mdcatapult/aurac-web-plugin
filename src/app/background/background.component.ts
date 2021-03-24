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
  StringMessage
} from 'src/types';
import {validDict} from './types';
import {map, switchMap} from 'rxjs/operators';

@Component({
  selector: 'app-background',
  template: '<app-logger></app-logger>',
})

export class BackgroundComponent {

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
      }
    });
  }

  private loadXRefs(entityTerm: string): void {
    const leadmineURL = `http://localhost:8081/entities/${entityTerm}`;
    const compoundConverterURL = 'http://localhost:8082/convert';
    const unichemURL = 'http://localhost:8080/x-ref';

    this.client.get(leadmineURL).pipe(
      switchMap((leadmineResult: LeadmineResult) => {
          const smiles = leadmineResult ? leadmineResult.entities[0].resolvedEntity : undefined;
          return this.client.get(`${compoundConverterURL}/${smiles}?from=SMILES&to=inchikey`);
        }
      ),
      switchMap((converterResult: ConverterResult) => this.client.get(`${unichemURL}/${converterResult.output}`)),
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
