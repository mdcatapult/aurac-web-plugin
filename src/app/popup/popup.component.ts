/*
 * Copyright 2022 Medicines Discovery Catapult
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
  sourcesError = false

  constructor(private browserService: BrowserService, private zone: NgZone) {
    this.browserService.addListener(msg => {
      this.zone.run(() => {
        switch (msg) {
          case 'popup_api_error':
            this.nerError = true
            break
          case 'popup_api_success':
            this.nerError = false
            break
        }
      })
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

  getHighlightTooltipText(): string {
    if (this.nerError) {
      return `An error has occurred: please ensure you are connected to the VPN,
      reload the page and re-click highlight.  If the problem persists please
      contact Software Engineering`
    } else {
      return 'Ask Aurac to highlight interesting things on the page'
    }
  }
}
