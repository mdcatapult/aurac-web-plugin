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
  }

  settingsClicked() {
    this.isSettings = true;
  }

  nerCurrentPage(dictionary: validDict) {
    this.log.Log('Sending message to background page...');
    // @ts-ignore
    browser.runtime.sendMessage<Message>({type: 'ner_current_page', body: dictionary})
      .catch(e => this.log.Error(`Couldn't send message to background page: ${JSON.stringify(e)}`));
  }

  toggleSidebar() {
    this.browserService.sendMessageToActiveTab({type: 'toggle_sidebar'})
      .catch(e => this.log.Error(`Couldn't send message of type 'toggle_sidebar' : ${JSON.stringify(e)}`));
  }
}
