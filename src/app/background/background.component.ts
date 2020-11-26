import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
    browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT}).then(tabs => {
      const tabId = tabs[0].id;
      browser.tabs.sendMessage<any, any>(tabId, {type: 'run_leadmine', tabId})
      .then(result => {
        console.log('Sending page content to leadmine...');
        this.client.post<any>('https://leadmine.wopr.inf.mdc/entities', result.page, {observe: 'response'})
          .subscribe((response) => {
            console.log(response);
          });
      });
    });
  }
}
