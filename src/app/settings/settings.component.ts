import {Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {defaultSettings, DictionaryURLs, Message} from '../../types';
import {LogService} from '../popup/log.service';

import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {SettingsService} from './settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  @Output() saved = new EventEmitter<DictionaryURLs>();
  @Output() closed = new EventEmitter<boolean>();

  dictionaryUrls = defaultSettings;
  validURLs = false;
  downloadJsonHref: SafeUrl; // used to as HREF link from HTML file
  settingsForm: FormGroup;


  // used to keep track of native fileUpload
  @ViewChild('fileUpload')
  fileUploadElementRef: ElementRef;

  constructor(private log: LogService,
              private sanitizer: DomSanitizer) {

  }

  ngOnInit(): void {
    this.settingsForm = new FormGroup({
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
    this.log.Log('sending load settings msg');
    browser.runtime.sendMessage<Message>({type: 'load-settings'})
      .catch(e => this.log.Error(`Couldn't send load-settings message to background page: ${e}`))
      .then((settings: DictionaryURLs) => {
        this.settingsForm.reset(settings);
      });

    // listen for form URL value changes and verify URLs are valid
    // downloadJsonHref is used to conditionally show & hide buttons that allow or disallow exporting URLs
    this.settingsForm.valueChanges.subscribe(formValues => {

      this.dictionaryUrls = formValues;
      this.validURLs = SettingsService.validURLs(this.dictionaryUrls);

      if (this.validURLs) {
        try {
          const json = JSON.stringify(this.dictionaryUrls);

          this.downloadJsonHref =
            this.sanitizer.bypassSecurityTrustResourceUrl('data:text/json;charset=UTF-8,' + encodeURIComponent(json));

        } catch (e) {
          this.validURLs = false;
          console.log('error creating JSON from URLs: ' + e);
        }
      } else {
        this.validURLs = false;
        console.log('error, dictionary URLs invalid');
      }
    });
  }

  getBorderColor(formName: string) : Object {


    return {'border-color' : this.settingsForm.get(formName).valid  ? 'red' : 'gray' }

    // return {'border-color' : this.settingsForm.get('leadmineURL').valid ? 'gray' : 'red'};
  }

  save(): void {
      this.saved.emit(this.settingsForm.value);
      this.closed.emit(true);
  }

  onFileSelected(ev: Event): void {
    const event = ev.target as HTMLInputElement;

    if (event.files && event.files.length > 0) {

      const file: File = event.files[0];
      const reader = new FileReader();

      console.log('file size');
      console.log(file.size); // TODO check file size?

      reader.onloadend = (_) => {

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

}
