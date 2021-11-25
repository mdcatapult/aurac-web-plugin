import { Component, Input } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { BrowserService } from 'src/app/browser.service'
import { APIURLs, defaultSettings } from '../../../../types/settings'
import { UrlValidator } from './url-validator'

@Component({
  selector: 'app-urls',
  templateUrl: './urls.component.html',
  styleUrls: ['./urls.component.scss']
})
export class UrlsComponent {

  constructor(private browserService: BrowserService){}

  private fb = new FormBuilder()
  form = this.fb.group({
    nerURL: new FormControl(
      defaultSettings.urls.nerURL,
      Validators.compose([Validators.required, UrlValidator.validator])
    ),
    compoundConverterURL: new FormControl(
      defaultSettings.urls.compoundConverterURL,
      Validators.compose([Validators.required, UrlValidator.validator])
    ),
    unichemURL: new FormControl(
      defaultSettings.urls.unichemURL,
      Validators.compose([Validators.required, UrlValidator.validator])
    ),
    pdfConverterURL: new FormControl(
      defaultSettings.urls.pdfConverterURL,
      Validators.compose([Validators.required, UrlValidator.validator])
    )
  })

  // The values associated with these keys MUST EQUAL the form group names
  // defined in the parent settings component. We should move the urls form
  // down into this component to remove this complexity.
  readonly urlKeys: APIURLs = {
    nerURL: 'nerURL',
    compoundConverterURL: 'compoundConverterURL',
    unichemURL: 'unichemURL',
    pdfConverterURL: 'pdfConverterURL'
  }

  save(): void{
    if (this.form.valid) {
      this.browserService
        .sendMessageToBackground({
          type: 'settings_service_set_urls',
          body: this.form.value
        })
        .catch(error =>
          console.error("couldn't send message 'settings_service_set_urls'", error)
        )
    }
  }
}
