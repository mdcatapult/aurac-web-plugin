import { Component } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { SettingsService } from 'src/app/background/settings.service'
import { BrowserService } from 'src/app/browser.service'

@Component({
  selector: 'app-x-ref-sources',
  templateUrl: './x-ref-sources.component.html',
  styleUrls: ['./x-ref-sources.component.scss']
})
export class XRefSourcesComponent {
  form = new FormGroup({})
  hasXRefs = false

  constructor(private browserService: BrowserService, private settingsService: SettingsService) {}

  ngOnInit() {
    this.browserService
      .sendMessageToBackground({
        type: 'settings_service_refresh_xref_sources',
        body: this.settingsService.APIURLs.unichemURL
      })
      .then((xRefSources: string[]) => {
        xRefSources.forEach(source => {
          this.form.addControl(source, new FormControl(true))
        })

        if (xRefSources.length) {
          this.hasXRefs = true
        }

        this.form.reset(this.settingsService.xRefSources)
      })

    this.settingsService.xRefSourcesObservable.subscribe(xrefs => this.form.reset(xrefs))
  }

  save(): void {
    if (this.form.valid) {
      this.browserService
        .sendMessageToBackground({
          type: 'settings_service_set_xrefs',
          body: this.form.value
        })
        .catch(error => console.error("couldn't send message 'settings_service_set_xrefs'", error))
    }
  }
}
