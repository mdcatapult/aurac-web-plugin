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

  constructor(private log: LogService, private http: HttpClient, private browser: BrowserService) {
  }

  ngOnInit(): void {
  }

  linkSelected(): void {
    if (!this.link.valid) {
      return
    }
    this.browser.loadSettings().then(settings => {
      const pdfURL = settings.urls.pdfConverterURL || defaultSettings.urls.pdfConverterURL
      this.http.post(pdfURL, null, {params: {url: this.link.value}})
        .subscribe(
          (converterResponse: { id: string }) => {
            browser.tabs.create({url: `${pdfURL}/${converterResponse.id}`, active: true});
          },
          (err) => this.log.Error(err)
        )
    })
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
