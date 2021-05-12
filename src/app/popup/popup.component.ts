import {Component, OnInit} from '@angular/core';
import {DictionaryURLs, Message} from 'src/types';
import {LogService} from './log.service';
import {validDict} from '../background/types';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {

  isSettings = false;

  constructor(private log: LogService) {
  }

  ngOnInit(): void {
  }

  settingsClicked() {
    this.isSettings = true;
  }

  onSaveSettings(settings: DictionaryURLs) {
    browser.runtime.sendMessage<Message>({type: 'save-settings', body: settings})
      .catch(e => this.log.Error(`Couldn't send message to background page: ${e}`));
  }

  nerCurrentPage(dictionary: validDict) {
    this.log.Log('Sending message to background page...');
    browser.runtime.sendMessage<Message>({type: 'ner_current_page', body: dictionary})
      .catch(e => this.log.Error(`Couldn't send message to background page: ${e}`));
  }
}
