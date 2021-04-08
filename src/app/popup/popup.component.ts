import {Component, OnInit} from '@angular/core';
import {Message, Settings} from 'src/types';
import {LogService} from './log.service';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {

  isSettings = false;
  settings: Settings = {
    leadmineURL: 'leadmineURL',
    compoundConverterURL: 'compoundURL',
    unichemURL: 'unichemURL',
}

  constructor(private log: LogService) {
  }

  ngOnInit(): void {
  }

  settingsClicked() {
    this.isSettings = true;
  }

  onSaveSettings(settings: Settings) {
    this.log.Log('Sending message to background page...');
    this.settings = settings;
    console.log('settings: ', settings);
    browser.runtime.sendMessage<Message>({type: 'settings', body: settings})
      .catch(e => this.log.Error(`Couldn't send message to background page: ${e}`));
  }

  nerCurrentPage(dictionary) {
    this.log.Log('Sending message to background page...');
    browser.runtime.sendMessage<Message>({type: 'ner_current_page', body: dictionary})
      .catch(e => this.log.Error(`Couldn't send message to background page: ${e}`));
  }
}
