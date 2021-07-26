import {Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {defaultSettings, DictionaryURLKeys, DictionaryURLs, Message} from '../../types';
import {LogService} from '../popup/log.service';
import {BrowserService} from '../browser.service';

import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {SettingsService} from './urls.service';


@Component({
  selector: 'app-urls',
  templateUrl: './urls.component.html',
  styleUrls: ['./urls.component.scss']
})
export class UrlsComponent implements OnInit {

  @Output() saved = new EventEmitter<DictionaryURLs>();
  @Output() closed = new EventEmitter<boolean>();

  dictionaryUrls = defaultSettings;
  downloadJsonHref: SafeUrl | undefined; // used to as HREF link from HTML file
  readonly urlKeys = DictionaryURLKeys;


  // used to keep track of native fileUpload
  @ViewChild('fileUpload')
  fileUploadElementRef: ElementRef | undefined;

  settingsForm = new FormGroup({
    leadmineURL: new FormControl(
      defaultSettings.leadmineURL,
      Validators.compose([Validators.required, SettingsService.validator])
    ),
    compoundConverterURL: new FormControl(
      defaultSettings.compoundConverterURL,
      Validators.compose([Validators.required, SettingsService.validator])
    ),
    unichemURL: new FormControl(
      defaultSettings.unichemURL,
      Validators.compose([Validators.required, SettingsService.validator])
    ),
  });

  constructor(private log: LogService, private browserService: BrowserService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {

    this.log.Log('sending load settings msg');
    this.browserService.sendMessage('load-settings')
      .then((settings: DictionaryURLs) => {
        this.settingsForm.reset(settings);
      });

    // listen for form URL value changes and verify URLs are valid
    this.settingsForm.valueChanges.subscribe(formValues => {

      this.dictionaryUrls = formValues;

      if (this.settingsForm.valid) {
        try {
          const json = JSON.stringify(this.dictionaryUrls);

          this.downloadJsonHref =
            this.sanitizer.bypassSecurityTrustResourceUrl('data:text/json;charset=UTF-8,' + encodeURIComponent(json));

        } catch (e) {
          this.log.Info(`error creating JSON from URLs: ${e}`);
        }
      } else {
        this.log.Info('error, dictionary URLs invalid');
      }
    });
  }

  getBorderColor(formName: string): object {
    let colour = 'gray';
    if (!this.settingsForm.get(formName)!.valid) {
      colour = 'red';
    }
    return {'border-color': colour};
  }

  save(): void {
    if (this.settingsForm.valid) {
      this.saved.emit(this.settingsForm.value);
      this.closed.emit(true);
    }
  }

  onFileSelected(ev: Event): void {
    const event = ev.target as HTMLInputElement;

    if (event.files && event.files.length > 0) {

      const file: File = event.files[0];
      const reader = new FileReader();

      // TODO check file size?

      reader.onloadend = () => {

        try {
          const dictionaryURLs = JSON.parse(reader.result as string) as DictionaryURLs;

          if (SettingsService.validURLs(dictionaryURLs)) {
            this.settingsForm.reset(dictionaryURLs);
            this.dictionaryUrls = dictionaryURLs;
          } else {
            // some URLs not valid
            // TODO error popup?
          }
        } catch (e) {
          this.log.Error(`error validating dictionary URLs from file: ${e}`);
        }

        // reset the file element to allow reloading of the same file
        this.fileUploadElementRef!.nativeElement.value = '';
      };

      reader.readAsText(file);
    } else {
      this.log.Error('No file selected');
    }
  }

  closeSettings(): void {
    this.closed.emit(true);
  }

}
