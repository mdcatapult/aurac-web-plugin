import {Component} from '@angular/core';
import {Logger} from '../logger';
import {BrowserService} from '../browser.service';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent {

  mode: 'menu' | 'settings' | 'pdf' = 'menu'

  constructor(private browserService: BrowserService) {
  }

  settingsClicked() {
    this.mode = 'settings'
  }

  nerCurrentPage(): void {
    this.browserService.loadSettings().then(settings => {
      this.browserService.sendMessage({ type: 'ner_current_page', body: settings.preferences.dictionary })
        .catch(Logger.error);
    })
  }

  toggleSidebar(): void {
    this.browserService.sendMessageToActiveTab({type: 'content_script_toggle_sidebar'})
      .catch(Logger.error);
  }

  pdfClicked(): void {
    this.mode = 'pdf'
  }

  exportResults(): void {
    this.browserService.sendMessage('export_csv')
  }
}
