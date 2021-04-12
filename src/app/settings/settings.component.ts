import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {defaultSettings, Message, Settings} from '../../types';
import {environment} from '../../environments/environment';
import {LogService} from '../popup/log.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  @Output() saved = new EventEmitter<Settings>();
  @Output() closed = new EventEmitter<boolean>();

  settingsForm = new FormGroup({
    leadmineURL: new FormControl(defaultSettings.leadmineURL),
    compoundConverterURL: new FormControl(defaultSettings.compoundConverterURL),
    unichemURL: new FormControl(defaultSettings.unichemURL),
  });

  constructor(private log: LogService) {}

  ngOnInit(): void {
    this.log.Log('sending load settings msg');
    browser.runtime.sendMessage<Message>({type: 'load-settings'})
      .catch(e => this.log.Error(`Couldn't send load-settings message to background page: ${e}`))
      .then((settings: Settings) => {
        this.log.Log('load settings msg:');
        this.log.Log(settings);
        this.settingsForm.reset(settings);
      });
  }

  save(): void {
    this.saved.emit(this.settingsForm.value);
    this.closed.emit(true);
  }

  closeSettings(): void {
    this.closed.emit(true);
  }
}
