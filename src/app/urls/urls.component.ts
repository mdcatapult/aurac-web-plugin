import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {defaultSettings, DictionaryURLKeys, DictionaryURLs, Message} from '../../types';
import {LogService} from '../popup/log.service';
import {BrowserService} from '../browser.service';

import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {UrlsService} from './urls.service';


@Component({
  selector: 'app-urls',
  templateUrl: './urls.component.html',
  styleUrls: ['./urls.component.scss']
})
export class UrlsComponent {

  @Input() urlsForm?: FormGroup

  dictionaryUrls = defaultSettings;
  readonly urlKeys = DictionaryURLKeys;

  constructor(private log: LogService) {}
  
  getBorderColor(formName: string): object {
    let colour = 'gray';
    if (!this.urlsForm!.get(formName)!.valid) {
      colour = 'red';
    }
    return {'border-color': colour};
  }


}
