import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
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

  constructor(private log: LogService) {
  }

  ngOnInit(): void {
    this.log.Log('sending load settings msg');
    browser.runtime.sendMessage<Message>({type: 'load-settings'})
      .catch(e => this.log.Error(`Couldn't send load-settings message to background page: ${e}`))
      .then((settings: Settings) => {
        this.settingsForm.reset(settings);
      });
  }

  save(): void {
    this.saved.emit(this.settingsForm.value);
    this.closed.emit(true);
  }

  export(): void {
    return;
  }

  load(): void {
    console.log('hell');
    document.querySelector('input').click();
  }

  onFileSelected(event: Event) {
    const e = event.target as HTMLInputElement;

    if (e.files && e.files.length > 0) {
      const reader = new FileReader();
      reader.onloadend = (x) => {
        // handle data processing
        console.log(reader.result.toString());
      };
      reader.readAsText(e.files[0]);
    } else {

      console.error('No file selected');
    }
    console.log('Change input file');

  }


  closeSettings(): void {
    this.closed.emit(true);
  }
}
