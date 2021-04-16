import {Component, OnInit} from '@angular/core';
import {Message, DictionaryURLs} from 'src/types';
import {LogService} from './log.service';

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

  nerCurrentPage(dictionary) {
    this.log.Log('Sending message to background page...');
    browser.runtime.sendMessage<Message>({type: 'ner_current_page', body: dictionary})
      .catch(e => this.log.Error(`Couldn't send message to background page: ${e}`));
  }
}
