import {Component} from '@angular/core';
import { EntityMessengerService } from './entity-messenger.service';
import { SettingsService } from './settings.service';
import { NerService } from './ner.service';
import {CsvExporterService} from './csv-exporter.service';

@Component({
  selector: 'app-background',
  template: '',
})

export class BackgroundComponent {

  constructor (
    private _entityMessengerService: EntityMessengerService,
    private _settingsService: SettingsService,
    private _nerService: NerService,
    private _csvExporterService: CsvExporterService
  ) { }
}
