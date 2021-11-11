import { HttpClient } from '@angular/common/http'
import { Component, EventEmitter, Output } from '@angular/core'
import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms'
import { defaultSettings } from 'src/types/settings'
import { BrowserService } from '../../browser.service'
import { UrlValidator } from '../settings/urls/url-validator'

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

  constructor(private http: HttpClient, private browser: BrowserService) {}

  linkSelected(): void {
    if (!this.link.valid) {
      return
    }
    this.browser.sendMessageToBackground('settings_service_get_settings').then(settings => {
      this.loadingHTML = true
      this.pdfError = ''
      const pdfURL = settings.urls.pdfConverterURL || defaultSettings.urls.pdfConverterURL
      this.http.post<{ id: string }>(pdfURL, null, { params: { url: this.link.value } }).subscribe(
        (converterResponse: { id: string }) => {
          this.browser
            .sendMessageToActiveTab({ type: 'awaiting_response', body: false })
            .catch(error => console.error("couldn't send message 'awaiting_response'", error))
          this.loadingHTML = false
          browser.tabs.create({ url: `${pdfURL}/${converterResponse.id}`, active: true })
        },
        err => {
          this.browser
            .sendMessageToActiveTab({ type: 'awaiting_response', body: false })
            .catch(error => console.error("couldn't send message 'awaiting_response'", error))
          this.loadingHTML = false
          this.pdfError = err.error.error
        }
      )
    })
    this.browser
      .sendMessageToActiveTab({ type: 'awaiting_response', body: true })
      .catch(error => console.error("couldn't send message 'awaiting_response'", error))
  }

  closeSettings(): void {
    this.closed.emit(true)
  }

  private linkValidator(control: AbstractControl): ValidationErrors | null {
    const link = control.value
    const isValid = UrlValidator.isValidURL(link) && link.slice(link.length - 4) === '.pdf'

    return isValid ? null : { invalidPDFLink: { value: link } }
  }
}
