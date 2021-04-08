import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Settings} from '../../types';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  @Output() saved = new EventEmitter<Settings>();
  @Output() closed = new EventEmitter<boolean>();

  settingsForm = new FormGroup({
    leadmineURL: new FormControl(environment.leadmineURL),
    compoundConverterURL: new FormControl(environment.compoundConverterURL),
    unichemURL: new FormControl(environment.unichemURL),
  });

  constructor() { }

  ngOnInit(): void {
  }

  save(): void {
    this.saved.emit(this.settingsForm.value);
  }

  closeSettings(): void {
    this.closed.emit(true);
  }



}
