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

    const identifierSourceToID = {
      'Accession': 'Q77Q38'
    }

    const entity: Entity = {
      metadata: {},
      synonymToXPaths: new Map([['K12', ['']]]),
      identifierSourceToID: new Map([['Homo sapiens', JSON.stringify(identifierSourceToID)]])
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
