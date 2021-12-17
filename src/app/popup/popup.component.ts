import { Component } from '@angular/core'
import { BrowserService } from '../browser.service'

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent {
  mode: 'menu' | 'settings' | 'pdf' = 'menu'

  constructor(private browserService: BrowserService) {}

  nerCurrentPage(): void {
    this.browserService
      .sendMessageToBackground('ner_service_process_current_page')
      .catch(error =>
        console.error("couldn't send message 'ner_service_process_current_page'", error)
      )
  }

  pdfClicked(): void {
    this.mode = 'pdf'
  }

  exportResults(): void {
    this.browserService
      .sendMessageToBackground('csv_exporter_service_export_csv')
      .catch(console.error)
  }
}
