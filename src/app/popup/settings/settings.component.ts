import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { timer } from 'rxjs';
import { debounce } from 'rxjs/operators';
import {defaultSettings, DictionaryURLs, Settings} from 'src/types';
import {BrowserService} from '../../browser.service';
import {LogService} from '../log.service';
import {UrlsService} from './urls/urls.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  @Output() saved = new EventEmitter<DictionaryURLs>();
  @Output() closed = new EventEmitter<boolean>();

  private fb = new FormBuilder()
  xRefSources?: Record<string,boolean>


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
    xRefSources: new FormGroup({}),
    preferences: this.fb.group({
      minEntityLength: new FormControl(
        defaultSettings.preferences.minEntityLength,
        Validators.required
      ),
      dictionary: new FormControl(defaultSettings.preferences.dictionary)
    })
  });

  ngOnInit(): void {
    this.browserService.sendMessage('settings_service_get_settings').then(settingsObj => {
      const settings = settingsObj as Settings
      this.xRefSources = settings.xRefSources
      this.settingsForm.reset(settings);

      this.settingsForm.valueChanges.pipe(debounce(() => timer(500))).subscribe(() => {
        this.log.Info("settings value changed")
        if (this.valid()) {
          this.save();
        }
      });

      // TODO: This is creating a race condition. How do we know that the new minimum entity length
      // setting has been changed before this message is sent?
      this.settingsForm.get('preferences')?.get('minEntityLength')!.valueChanges.subscribe(() => {
          if (this.valid()) {
            this.browserService.sendMessage('min-entity-length-changed')
              .catch(console.error);
          }
        }
      );

      this.settingsForm.get('urls')?.get('unichemURL')!.valueChanges.pipe(debounce(() => timer(500))).subscribe((url) => {
        if (this.valid()) {
          this.browserService.sendMessage({type: 'settings_service_refresh_xref_sources', body: url}).then((resp) => {
            this.xRefSources = resp as Record<string,boolean> 
          });
        }
      })
    });
  }

  valid(): boolean {
    Object.keys(this.settingsForm.controls).forEach(key => {
      if (this.settingsForm.get(key)!.invalid) {
        this.log.Error(`invalid settings: ${key}`)
      }
    })
    return this.settingsForm.valid;
  }

  save(): void {
    if (this.valid()) {
      this.browserService.sendMessage({type: 'settings_service_set_settings', body: this.settingsForm.value})
        .catch(msg => this.log.Error(msg));
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
