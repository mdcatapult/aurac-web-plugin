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
  private xRefSources: {[key: string]: boolean} = {}
  form = new FormGroup({})

  constructor(private browserService: BrowserService, private settingsService: SettingsService) {
  }
  
  ngOnInit(){
    this.browserService
    .sendMessageToBackground({
      type: 'settings_service_refresh_xref_sources',
      body: this.settingsService.APIURLs.unichemURL
    })
    .then(resp => {
      this.xRefSources = resp as Record<string, boolean>

      Object.entries(this.xRefSources).map(([key, value]) => {
        this.form.addControl(key, new FormControl(value))
      })
    })
  }

  hasXRefs(): boolean {
    return this.xRefSources && Object.keys(this.xRefSources).length > 0
  }

  save(): void{
    if (this.form.valid) {
      this.browserService
        .sendMessageToBackground({
          type: 'settings_service_set_xrefs',
          body: this.form.value
        })
        .catch(error =>
          console.error("couldn't send message 'settings_service_set_xrefs'", error)
        )
    }
  }
}
