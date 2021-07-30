import {Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {defaultSettings, DictionaryURLs, Message, Settings} from 'src/types';
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
  dictionaryUrls = defaultSettings.urls;

  constructor(private log: LogService, private browserService: BrowserService, private sanitizer: DomSanitizer) {
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
  });

  ngOnInit(): void {
    browser.storage.local.get('settings').then(
      (settings) => {
        // @ts-ignore
        this.settings = settings.settings
        this.settingsForm.reset(this.settings)
      },
      (err) => this.log.Error(`error loading settings: ${JSON.stringify(err)}`)
    )
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
      // this.closed.emit(true);
      this.log.Log('saving')
      browser.storage.local.set({settings: this.settingsForm.value}).then(
        () => {},
        // () => {this.log.Log('set::::'); this.log.Log(this.settingsForm.value)},
        (err) => this.log.Log(`error saving settings', ${err}`)
      )
    }
  }

  closeSettings(): void {
    this.closed.emit(true);
  }
}
