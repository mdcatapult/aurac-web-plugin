import {Component, OnInit} from '@angular/core';
import {DictionaryURLs, Message, StringMessage} from 'src/types';
import {LogService} from './log.service';
import {validDict} from '../background/types';
import {BrowserService} from '../browser.service';
import {logger} from 'codelyzer/util/logger';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {

  isSettings = false;
  isSidebarRendered = false;
  isNerLoaded = false;

  constructor(private log: LogService, private browserService: BrowserService) {
  }

  ngOnInit(): void {
    const result = this.browserService.sendMessageToActiveTab({type: 'sidebar_rendered'});
    result.then((a) => {
      const res = a as StringMessage;
      this.isNerLoaded = res.body.includes('true');
      if (this.isNerLoaded) {
        this.isSidebarRendered = true;
      }
    }).catch(e => {
      this.log.Error(`Unable to retrieve sidebar data from the script': ${JSON.stringify(e)}`);
    });
  }

  settingsClicked() {
    this.isSettings = true;
  }

  nerCurrentPage(dictionary: validDict) {
    this.isSidebarRendered = true;
    this.isNerLoaded = true;
    this.sendNERToPage();
    this.log.Log('Sending message to background page...');
    // @ts-ignore
    browser.runtime.sendMessage<Message>({type: 'ner_current_page', body: dictionary})
      .catch(e => this.log.Error(`Couldn't send message to background page: ${JSON.stringify(e)}`));
  }

  toggleSidebar() {
    this.browserService.sendMessageToActiveTab({type: 'toggle_sidebar'})
      .catch(e => this.log.Error(`Couldn't send message of type 'toggle_sidebar' : ${JSON.stringify(e)}`));
  }

  sendNERToPage() {
    this.browserService.sendMessageToActiveTab({type: 'ner_lookup_performed'})
      .catch(e => this.log.Error(`Couldn't send message that NER has been performed: ${JSON.stringify(e)}`));
  }
}
