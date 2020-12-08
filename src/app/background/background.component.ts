import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LeadmineMessage, LeadminerResult, Message, StringMessage } from 'src/types';

@Component({
  selector: 'app-background',
  template: '<app-logger></app-logger>',
})
export class BackgroundComponent {

  constructor(private client: HttpClient) {
    browser.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'ner_current_page') {
        console.log('Received message from popup...');
        this.nerCurrentPage();
      }
    });
  }

  nerCurrentPage() {
    console.log('Getting content of active tab...');
    let tab;
    browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT}).then(tabs => {
      tab = tabs[0].id;
      browser.tabs.sendMessage<Message, StringMessage>(tab, {type: 'get_page_contents'})
      .catch(e => console.error(e))
      .then(result => {
        result = result as StringMessage;
        console.log('Sending page contents to leadmine...');
        this.client.post<LeadminerResult>('https://leadmine.wopr.inf.mdc/entities', result.body, {observe: 'response'})
          .subscribe((response) => {
            console.log('Received results from leadmine...');
            browser.tabs.sendMessage<LeadmineMessage>(tab, {type: 'markup_page', body: response.body});
          });
      });
    });
  }
}
