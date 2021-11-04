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
    this.browserService.sendMessage('ner_service_process_current_page')
      .catch((error) => Logger.error("couldn't send message 'ner_service_process_current_page'", error));
  }

  toggleSidebar(): void {
    this.browserService.sendMessageToActiveTab({type: 'content_script_toggle_sidebar'})
      .catch((error) => Logger.error("couldn't send message 'content_script_toggle_sidebar'", error));
  }

  pdfClicked(): void {
    this.mode = 'pdf'
  }

  exportResults(): void {
    this.browserService.sendMessage('csv_exporter_export_csv')
      .catch((error) => Logger.error("couldn't send message 'csv_exporter_export_csv'", error));

  }
}
