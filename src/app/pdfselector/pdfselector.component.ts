import {HttpClient, HttpParams} from '@angular/common/http';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, FormControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import {defaultSettings} from 'src/types';
import {BrowserService} from '../browser.service';
import {LogService} from '../popup/log.service';
import {UrlsService} from '../urls/urls.service'

@Component({
  selector: 'app-pdfselector',
  templateUrl: './pdfselector.component.html',
  styleUrls: ['./pdfselector.component.scss']
})
export class PDFSelectorComponent implements OnInit {

  @Output() closed = new EventEmitter<boolean>()
  link = new FormControl('', this.linkValidator)
  loadingHTML = false
  pdfError = ''

  constructor(private log: LogService, private http: HttpClient, private browser: BrowserService) {
  }

  ngOnInit(): void {
  }

  linkSelected(): void {
    if (!this.link.valid) {
      return
    }
    this.browser.loadSettings().then(settings => {
      this.loadingHTML = true
      this.pdfError = ''
      const pdfURL = settings.urls.pdfConverterURL || defaultSettings.urls.pdfConverterURL
      this.http.post<{id: string}>(pdfURL, null, {params: {url: this.link.value}})
        .subscribe((converterResponse: { id: string }) => {
            this.browser.sendMessageToActiveTab({type: 'awaiting_response', body: false})
              .catch(e => console.error(e));

            this.loadingHTML = false
            browser.tabs.create({url: `${pdfURL}/${converterResponse.id}`, active: true});
          },
          err => {
            this.loadingHTML = false
            this.pdfError = err.error.error
          }
        )
    })
    this.browser.sendMessageToActiveTab({type: 'awaiting_response', body: true})
      .catch(e => console.error(e));
  }

  closeSettings(): void {
    this.closed.emit(true);
  }

  private linkValidator(control: AbstractControl): ValidationErrors | null {
    const link = control.value
    const isValid = UrlsService.isValidURL(link) && link.slice(link.length - 4) === '.pdf'
    return isValid ? null : {invalidPDFLink: {value: link}}
  }
}
