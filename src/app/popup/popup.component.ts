import {Component, OnInit} from '@angular/core';
import {Settings} from 'src/types';
import {LogService} from './log.service';
import {validDict} from '../background/types';
import {BrowserService} from '../browser.service';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {

  isSettings = false;

  constructor(private log: LogService, private browserService: BrowserService) {
  }

  ngOnInit(): void {
  }

  settingsClicked() {
    this.isSettings = true;
  }

  onSaveSettings(settings: Settings) {
    this.browserService.sendMessage('save-settings', settings);
  }

  nerCurrentPage(dictionary: validDict) {
    this.browserService.sendMessage('ner_current_page', dictionary);
  }
}
