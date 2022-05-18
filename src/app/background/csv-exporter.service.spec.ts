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

import { TestBed, waitForAsync } from '@angular/core/testing'

import { CsvExporterService } from './csv-exporter.service'
import { BrowserService } from '../browser.service'
import { TestBrowserService } from '../test-browser.service'
import { EntitiesService } from './entities.service'
import { SettingsService } from './settings.service'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { Entity } from 'src/types/entity'

describe('CsvExporterService', () => {
  let service: CsvExporterService

  const headerText = `Synonym,Identifier`

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          { provide: BrowserService, useClass: TestBrowserService },
          EntitiesService,
          SettingsService
        ]
      })
      service = TestBed.inject(CsvExporterService)
    })
  )

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should return a string containing column headers and relevant entity data for Leadmine recogniser', () => {
    const entity: Entity = {
      metadata: {
        entityGroup: 'Gene or Protein',
        RecognisingDict: {
          enforceBracketing: false,
          entityType: 'GeneOrProteinMDC',
          htmlColor: 'pink',
          maxCorrectionDistance: 0,
          minimumCorrectedEntityLength: 9,
          minimumEntityLength: 0,
          source: '/srv/config/common/mdc/dictionary/mdc_gene_protein.cfx'
        }
      },
      synonymToXPaths: new Map([['K12', ['']]]),
      identifierSourceToID: new Map([['resolvedEntity', 'HGNC:6414']])
    }
    const entities: Array<Entity> = [entity]
    const actual = service.entitiesToCSV(entities, 'leadmine-proteins')

    const entityInfo = `"K12",HGNC:6414`
    const expected = headerText + '\n' + entityInfo + '\n'

    expect(actual).toEqual(expected)
  })

  it('should return a string containing column headers and relevant entity data for swissprot recogniser', () => {
    const entity: Entity = {
      metadata: {},
      synonymToXPaths: new Map([['K12', ['']]]),
      identifierSourceToID: new Map([['Accession', 'Q77Q38']])
    }
    const entities: Array<Entity> = [entity]
    const actual = service.entitiesToCSV(entities, 'swissprot-genes-proteins')

    const entityInfo = `"K12",Q77Q38`
    const expected = headerText + '\n' + entityInfo + '\n'

    expect(actual).toEqual(expected)
  })

  it('should return an empty string if passed an empty array', () => {
    expect(service.entitiesToCSV([], 'leadmine-proteins')).toEqual('')
  })
})
