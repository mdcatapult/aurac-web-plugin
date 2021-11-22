import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { min } from 'lodash'
import { timer } from 'rxjs'
import { debounce } from 'rxjs/operators'
import { defaultSettings, APIURLs, Settings } from 'src/types/settings'
import { BrowserService } from '../../browser.service'
import { UrlValidator } from './urls/url-validator'

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  @Output() saved = new EventEmitter<APIURLs>()
  @Output() closed = new EventEmitter<boolean>()

  private fb = new FormBuilder()
  xRefSources?: Record<string, boolean>

  constructor(private browserService: BrowserService) {}

  settingsForm = this.fb.group({
    urls: this.fb.group({
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
    }),
    xRefSources: new FormGroup({}),
    preferences: this.fb.group({
      minEntityLength: new FormControl(
        defaultSettings.preferences.minEntityLength,
        Validators.required
      ),
      recogniser: new FormControl(defaultSettings.preferences.recogniser)
    })
  })

  ngOnInit(): void {
    this.browserService
      .sendMessageToBackground('settings_service_get_settings')
      .then(settingsObj => {
        const settings = settingsObj as Settings
        this.xRefSources = settings.xRefSources
        this.settingsForm.reset(settings)

        this.settingsForm.valueChanges.pipe(debounce(() => timer(500))).subscribe(v => {
          if (this.valid()) {
            this.save()
          }
        })

        // TODO: This is creating a race condition. How do we know that the new minimum entity length
        // setting has been changed before this message is sent?
        this.settingsForm
          .get('preferences')
          ?.get('minEntityLength')!
          .valueChanges.subscribe(minEntityLength => {
            if (this.valid()) {
              this.browserService
                .sendMessageToBackground({
                  type: 'min_entity_length_changed',
                  body: minEntityLength
                })
                .catch(error =>
                  console.error("couldn't send message 'min_entity_length_changed'", error)
                )
            }
          })

        this.settingsForm
          .get('urls')
          ?.get('unichemURL')!
          .valueChanges.pipe(debounce(() => timer(500)))
          .subscribe(url => {
            if (this.valid()) {
              this.browserService
                .sendMessageToBackground({
                  type: 'settings_service_refresh_xref_sources',
                  body: url
                })
                .then(resp => {
                  this.xRefSources = resp as Record<string, boolean>
                })
            }
          })
      })
  }

  valid(): boolean {
    Object.keys(this.settingsForm.controls).forEach(key => {
      if (this.settingsForm.get(key)!.invalid) {
        console.error(`invalid settings: ${key}`)
      }
    })

    return this.settingsForm.valid
  }

  save(): void {
    if (this.valid()) {
      this.browserService
        .sendMessageToBackground({
          type: 'settings_service_set_settings',
          body: this.settingsForm.value
        })
        .catch(error =>
          console.error("couldn't send message 'settings_service_set_settings'", error)
        )
    }
  }

  reset(): void {
    this.settingsForm.reset(defaultSettings)
  }

  closeSettings(): void {
    if (!this.settingsForm.valid) {
      this.settingsForm.get('urls')!.reset(defaultSettings.urls)
    }
    this.closed.emit(true)
  }
}
