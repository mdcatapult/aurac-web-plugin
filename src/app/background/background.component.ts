/*
 * Copyright 2022 Medicines Discovery Catapult
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component } from '@angular/core'
import { EntityMessengerService } from './entity-messenger.service'
import { SettingsService } from './settings.service'
import { NerService } from './ner.service'
import { CsvExporterService } from './csv-exporter.service'

@Component({
  selector: 'app-background',
  template: ''
})
export class BackgroundComponent {
  constructor(
    private _entityMessengerService: EntityMessengerService,
    private _settingsService: SettingsService,
    private _nerService: NerService,
    private _csvExporterService: CsvExporterService
  ) {}
}
