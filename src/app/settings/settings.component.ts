import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {defaultSettings, DictionaryURLs, Settings} from 'src/types';
import {BrowserService} from '../browser.service';
import {LogService} from '../popup/log.service';
import {UrlsService} from '../urls/urls.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  @Output() saved = new EventEmitter<DictionaryURLs>();
  @Output() closed = new EventEmitter<boolean>();

  private fb = new FormBuilder()
  settings?: Settings
  @Input() urlPressed = false;
  @Input() urlsForm?: FormGroup


  constructor(private log: LogService, private browserService: BrowserService) {
  }

  settingsForm = this.fb.group({
    urls: this.fb.group({
      leadmineURL: new FormControl(
        defaultSettings.urls.leadmineURL,
        Validators.compose([Validators.required, UrlsService.validator])
      ),
      compoundConverterURL: new FormControl(
        defaultSettings.urls.compoundConverterURL,
        Validators.compose([Validators.required, UrlsService.validator])
      ),
      unichemURL: new FormControl(
        defaultSettings.urls.unichemURL,
        Validators.compose([Validators.required, UrlsService.validator])
      ),
      pdfConverterURL: new FormControl(
        defaultSettings.urls.pdfConverterURL,
        Validators.compose([Validators.required, UrlsService.validator])
      )
    }),
    xRefConfig: new FormGroup({}),
  });

  ngOnInit(): void {
    this.browserService.loadSettings().then(settings => {
      this.settings = settings || defaultSettings
      this.settingsForm.reset(this.settings)
    })

    this.settingsForm.valueChanges.subscribe(settings => {

      if (this.settingsForm.valid) {
        this.settings!.urls = settings.urls
        this.save()
      } else {
        this.log.Info('error, dictionary URLs invalid');
      }
    })
  }


  save(): void {
    if (this.settingsForm.valid) {
      this.browserService.saveSettings(this.settingsForm.value)
      this.browserService.sendMessage('settings-changed', this.settingsForm.value)
    }
  }

  reset(): void {
    this.settingsForm.reset(defaultSettings)
  }

  closeSettings(): void {
    if (!this.settingsForm.valid) {
      this.settingsForm.get('urls')!.reset(defaultSettings.urls)
    }
    this.closed.emit(true);
  }

  urlsClicked(): void {
    this.urlPressed = true;
  }

  urlsNotClicked(): void {
    this.urlPressed = false;
  }
}
