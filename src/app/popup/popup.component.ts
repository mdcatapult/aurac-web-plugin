import {Component} from '@angular/core';
import {LogService} from './log.service';
import {validDict} from '../background/types';
import {BrowserService} from '../browser.service';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent {

  mode: 'menu' | 'settings' | 'pdf' = 'menu'

  constructor(private log: LogService, private browserService: BrowserService) {
  }

  settingsClicked() {
    this.browserService.sendMessageToActiveTab({type: 'settings_clicked'})
    // this.mode = 'settings'
  }

  nerCurrentPage(): void {
    this.browserService.loadSettings().then(settings => {
      this.log.Log('Sending message to background page...');
      this.browserService.sendMessage({ type: 'ner_current_page', body: settings.preferences.dictionary })
        .catch(e => this.log.Error(`Couldn't send message to background page: ${JSON.stringify(e)}`));
    })
  }

  toggleSidebar(): void {
    this.browserService.sendMessageToActiveTab({type: 'content_script_toggle_sidebar'})
      .catch(e => this.log.Error(`Couldn't send message of type 'toggle_sidebar' : ${JSON.stringify(e)}`));
  }

  pdfClicked(): void {
    this.mode = 'pdf'
  }

  exportResults(): void {
    this.browserService.sendMessage('export_csv')
  }
}
