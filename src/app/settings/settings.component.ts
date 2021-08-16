import {Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {defaultSettings, DictionaryURLs, Message, Preferences, Settings} from 'src/types';
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

  private fb = new FormBuilder();
  settings?: Settings;
  dictionaryUrls = defaultSettings.urls;
  preferences: Preferences = {} as Preferences;

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
        defaultSettings.preferences.minEntityLength
      )
    })
  });

  ngOnInit(): void {
    this.browserService.loadSettings().then(settings => {
      this.settings = settings || defaultSettings;
      this.settingsForm.reset(this.settings);
    });

    this.settingsForm.valueChanges.subscribe(settings => {

      if (this.settingsForm.valid) {
        this.settings!.urls = settings.urls;
        this.save();
      } else {
        this.log.Info('error, dictionary URLs invalid');
      }
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
