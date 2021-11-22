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

  const headerText = `Synonym,Resolved Entity,Entity Group,Enforce Bracketing,Entity Type,HTML Color,Maximum Correction Distance,Minimum Corrected Entity Length,Minimum Entity Length,Source`

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

  it('should return a string containing column headers and relevant entity data', () => {
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
    const actual = service.leadmineToCSV(entities)

    const entityInfo = `"K12",HGNC:6414,Gene or Protein,false,GeneOrProteinMDC,pink,0,9,0,/srv/config/common/mdc/dictionary/mdc_gene_protein.cfx`
    const expected = headerText + '\n' + entityInfo + '\n'

    expect(actual).toEqual(expected)
  })

  it('should return an empty string if passed an empty array', () => {
    expect(service.leadmineToCSV([])).toEqual('')
  })
})
