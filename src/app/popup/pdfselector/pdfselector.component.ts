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

import { HttpClient } from '@angular/common/http'
import { Component, EventEmitter, Output } from '@angular/core'
import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms'
import { defaultSettings } from 'src/types/settings'
import { BrowserService } from '../../browser.service'
import { UrlValidator } from '../settings/urls/url-validator'
import Tab = browser.tabs.Tab

@Component({
  selector: 'app-pdfselector',
  templateUrl: './pdfselector.component.html',
  styleUrls: ['./pdfselector.component.scss']
})
export class PDFSelectorComponent {
  @Output() closed = new EventEmitter<boolean>()
  link = new FormControl('', this.linkValidator)
  loadingHTML = false
  pdfError = ''
  currentTabID = 0

  constructor(private http: HttpClient, private browser: BrowserService) {}

  linkSelected(): void {
    if (!this.link.valid) {
      return
    }
    this.browser.sendMessageToBackground('settings_service_get_settings').then(settings => {
      this.loadingHTML = true
      this.pdfError = ''
      const pdfURL = settings.urls.pdfConverterURL || defaultSettings.urls.pdfConverterURL

      this.browser.getActiveTab().then(response => {
        this.currentTabID = response.id!

        this.browser
          .sendMessageToBackground({
            type: 'entity_messenger_service_convert_pdf',
            body: { pdfURL: pdfURL, param: this.link.value, id: this.currentTabID }
          })
          .catch(err => {
            this.browser
              .sendMessageToActiveTab({ type: 'content_script_close_loading_icon', body: false })
              .catch(error =>
                console.error(
                  "could not send message 'content_script_close_loading_icon'",
                  JSON.stringify(error)
                )
              )
            this.loadingHTML = false
            this.pdfError = err.error
          })
      })
      this.browser
        .sendMessageToActiveTab({ type: 'content_script_open_loading_icon', body: true })
        .catch(error =>
          console.error(
            "could not send message 'content_script_open_loading_icon'",
            JSON.stringify(error)
          )
        )
    })
  }

  private linkValidator(control: AbstractControl): ValidationErrors | null {
    const link = control.value
    const isValid = UrlValidator.isValidURL(link) && link.slice(link.length - 4) === '.pdf'

    return isValid ? null : { invalidPDFLink: { value: link } }
  }
}
