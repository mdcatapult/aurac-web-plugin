import {Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {defaultSettings, DictionaryURLs, Message} from 'src/types';
import {BrowserService} from '../browser.service';
import {LogService} from '../popup/log.service';
import {SettingsService} from '../urls/urls.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  @Output() saved = new EventEmitter<DictionaryURLs>();
  @Output() closed = new EventEmitter<boolean>();

  // used to keep track of native fileUpload
  @ViewChild('fileUpload')
  fileUploadElementRef: ElementRef | undefined;
  downloadJsonHref: SafeUrl | undefined; // used to as HREF link from HTML file
  private fb = new FormBuilder()
  dictionaryUrls = defaultSettings.urls;

  constructor(private log: LogService, private browserService: BrowserService) {
  }


  settingsForm = this.fb.group({
    urls: this.fb.group({
      leadmineURL: new FormControl(
        defaultSettings.urls.leadmineURL,
        Validators.compose([Validators.required, SettingsService.validator])
      ),
      compoundConverterURL: new FormControl(
        defaultSettings.urls.compoundConverterURL,
        Validators.compose([Validators.required, SettingsService.validator])
      ),
      unichemURL: new FormControl(
        defaultSettings.urls.unichemURL,
        Validators.compose([Validators.required, SettingsService.validator])
      )
    }),
    xRefConfig: this.fb.group({})
  });

  ngOnInit(): void {
    this.log.Log('loading:')
    this.log.Log(window.localStorage.getItem('settings'))
    this.settingsForm.reset(JSON.parse(window.localStorage.getItem('settings')!));
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

  save(): void {

    if (this.settingsForm.valid) {
      this.closed.emit(true);
      window.localStorage.setItem('settings', JSON.stringify(this.settingsForm.value));
      this.log.Log('set:')
      this.log.Log(window.localStorage.getItem('settings'))
    }
  }


  closeSettings(): void {
    this.closed.emit(true);
  }
}
