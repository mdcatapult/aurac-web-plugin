import {Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {defaultSettings, DictionaryURLs, Message} from '../../types';
import {LogService} from '../popup/log.service';

import {DomSanitizer, SafeUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  @Output() saved = new EventEmitter<DictionaryURLs>();
  @Output() closed = new EventEmitter<boolean>();

  dictionaryUrls = defaultSettings;
  downloadJsonHref: SafeUrl;

  settingsForm = new FormGroup({
    leadmineURL: new FormControl(defaultSettings.leadmineURL),
    compoundConverterURL: new FormControl(defaultSettings.compoundConverterURL),
    unichemURL: new FormControl(defaultSettings.unichemURL),
  });


  // used to keep track of native fileUpload
  @ViewChild('fileUpload')
  fileUploadElementRef: ElementRef;

  constructor(private log: LogService, private sanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
    this.log.Log('sending load settings msg');
    browser.runtime.sendMessage<Message>({type: 'load-settings'})
      .catch(e => this.log.Error(`Couldn't send load-settings message to background page: ${e}`))
      .then((settings: DictionaryURLs) => {
        this.settingsForm.reset(settings);
      });


    this.settingsForm.valueChanges.subscribe(formValues => {
      this.dictionaryUrls = formValues;

      try {
        const json = JSON.stringify(this.dictionaryUrls);

        this.downloadJsonHref =
          this.sanitizer.bypassSecurityTrustResourceUrl('data:text/json;charset=UTF-8,' + encodeURIComponent(json));

      } catch (e) {
        console.log('error creating JSON from URL: ' + e);
      }
    });
  }

  save(): void {
    this.saved.emit(this.settingsForm.value);
    this.closed.emit(true);
  }

  onFileSelected(event: Event) {
    const e = event.target as HTMLInputElement;

    if (e.files && e.files.length > 0) {

      const file: File = e.files[0];
      const reader = new FileReader();

      console.log('file size');
      console.log(file.size); // check file size?

      reader.onloadend = (_) => {

        try {
          const dictionaryURLs = JSON.parse(reader.result as string) as DictionaryURLs;

          if (this.validURLs(dictionaryURLs)) {
            this.settingsForm.reset(dictionaryURLs);
            this.dictionaryUrls = dictionaryURLs;
          } else {
            // some URLs not valid
            // TODO error popup?
          }
        } catch (e) {
          console.log('error validating dictionary URLs from file: ' + e);
        }

        // reset the file element to allow reloading of the same file
        this.fileUploadElementRef.nativeElement.value = '';
      };

      reader.readAsText(file);
    } else {
      console.error('No file selected');
    }
  }


  closeSettings(): void {
    this.closed.emit(true);
  }

  // check if keys exist and we can make a URL
  validURLs(urls: DictionaryURLs): boolean {

    // TODO probably better to have an array of URLs?
    if (!urls.leadmineURL || !urls.unichemURL || !urls.compoundConverterURL) {
      return false;
    }

    try {
      for (const urlsKey of Object.keys(urls)) {
        const validURL = new URL(urls[urlsKey]);

        if (!validURL) {
          return false;
        }
      }
    } catch (e) {
      return false;
    }

    return true;
  }
}
