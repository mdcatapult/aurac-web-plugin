import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {defaultSettings, Settings} from '../../types';
import {LogService} from '../popup/log.service';
import {BrowserService} from '../browser.service';

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

  constructor(private log: LogService, private browserService: BrowserService) {}

  ngOnInit(): void {
    this.log.Log('sending load settings msg');
    this.browserService.sendMessage('load-settings')
      .then((settings: Settings) => {
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
