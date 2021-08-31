import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {DictionaryURLs, Settings} from 'src/types';
import {defaultSettings} from 'src/consts';
import {BrowserService} from '../browser.service';
import {LogService} from '../popup/log.service';
import {UrlsService} from '../urls/urls.service';
import {SettingsService} from './settings.service'

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  @Output() saved = new EventEmitter<DictionaryURLs>();
  @Output() closed = new EventEmitter<boolean>();

  private fb = new FormBuilder();
  settings?: Settings;

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
      )
    }),
    xRefConfig: new FormGroup({}),
    preferences: this.fb.group({
      hideUnresolved: new FormControl(
        defaultSettings.preferences.hideUnresolved
      ),
      minEntityLength: new FormControl(
        defaultSettings.preferences.minEntityLength,
        Validators.compose([Validators.pattern(/^[1-9]$/), Validators.required])
      )
    })
  });

  ngOnInit(): void {
    SettingsService.loadSettings(this.browserService, (settings) => {
      this.settings = settings || defaultSettings
      this.settingsForm.reset(this.settings);
    }).then(() => {
      this.settingsForm.valueChanges.subscribe(settings => {

        if (this.settingsForm.valid) {
          this.settings.urls = settings.urls;
          this.save();
        } else {
          if (this.settingsForm.get('urls')!.invalid) {
            this.log.Info('error, dictionary URLs invalid');
          }

          if (this.settingsForm.get('preferences')!.invalid) {
            this.log.Info('error, invalid preferences');
          }
        }
      });
    });
  }

  save(): void {
    if (this.settingsForm.valid) {
      this.browserService.saveSettings(this.settingsForm.value);
      this.browserService.sendMessage('settings-changed', this.settingsForm.value);
    }
  }

  reset(): void {
    this.settingsForm.reset(defaultSettings);
  }

  closeSettings(): void {
    if (!this.settingsForm.valid) {
      this.settingsForm.get('urls')!.reset(defaultSettings.urls);
    }
    this.closed.emit(true);
  }
}
