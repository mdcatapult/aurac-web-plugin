import {Component} from '@angular/core';
import {Message} from 'src/types';
import {LogService} from './log.service';
import {validDict} from '../background/types';
import {BrowserService} from '../browser.service';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent {

  isSettings = false;

  constructor(private log: LogService, private browserService: BrowserService) {
  }

  settingsClicked() {
    this.isSettings = true;
  }

  nerCurrentPage(dictionary: validDict) {
    this.log.Log('Sending message to background page...');
    browser.runtime.sendMessage<Message>({type: 'ner_current_page', body: dictionary})
      .catch(e => this.log.Error(`Couldn't send message to background page: ${JSON.stringify(e)}`));
  }

  toggleSidebar() {
    this.browserService.sendMessageToActiveTab({type: 'toggle_sidebar'})
      .catch(e => this.log.Error(`Couldn't send message of type 'toggle_sidebar' : ${JSON.stringify(e)}`));
  }
}
