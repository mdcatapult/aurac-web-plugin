import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
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

  @Input() urlsForm?: FormGroup

  dictionaryUrls = defaultSettings;
  downloadJsonHref: SafeUrl | undefined; // used to as HREF link from HTML file
  readonly urlKeys = DictionaryURLKeys;
  
  constructor(private log: LogService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    // listen for form URL value changes and verify URLs are valid
    this.urlsForm!.valueChanges.subscribe(formValues => {

      this.dictionaryUrls = formValues;

      if (this.urlsForm!.valid) {
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
    if (!this.urlsForm!.get(formName)!.valid) {
      colour = 'red';
    }
    return {'border-color': colour};
  }


}
