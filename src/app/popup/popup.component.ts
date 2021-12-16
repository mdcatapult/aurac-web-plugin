import { Component, NgZone } from '@angular/core'
import { BrowserService } from '../browser.service'

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent {
  mode: 'menu' | 'settings' | 'pdf' = 'menu'

  nerError = false

  constructor(private browserService: BrowserService, private ngZone: NgZone) {
    this.browserService.addListener(msg => {
      switch (msg) {
        case 'popup_api_error':
          this.ngZone.run(() => (this.nerError = true))
          break
        case 'popup_api_success':
          this.ngZone.run(() => (this.nerError = false))
      }
    })
  }

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

  getTooltipText(): string {
    if (this.nerError) {
      return `An error has occurred: please ensure you are connected to the VPN,
      reload the page and re-click highlight.  If the problem persists please
      contact Software Engineering`
    } else {
      return 'Ask Aurac to highlight interesting things on the page'
    }
  }
}
