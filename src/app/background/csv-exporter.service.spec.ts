import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {CsvExporterService} from './csv-exporter.service';
import {HttpClient, HttpHandler} from '@angular/common/http';
import {BackgroundComponent} from './background.component';
import {BrowserService} from '../browser.service';
import {TestBrowserService} from '../test-browser.service';
import {EntitiesService} from './entities.service';
import {SettingsService} from './settings.service';
import {Entity, TabEntities} from '../../types';

fdescribe('CsvExporterService', () => {
  let service: CsvExporterService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        HttpClient,
        HttpHandler,
        {provide: BrowserService, useClass: TestBrowserService},
        CsvExporterService,
        EntitiesService,
        SettingsService
      ]
    })
    service = TestBed.inject(CsvExporterService)
  }));


  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return a populated tab entities', () => {
    const resolvedEntity = 'HGNC:8756'
    const entity: Entity = {
      htmlTagIDs: undefined,
      identifiers: undefined,
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
      synonyms: undefined
    }


    const entities: Map<string, Entity> = new Map([[resolvedEntity, entity]])
    const result = service.leadmineToCSV(entities)
    const expectedResult = `Synonym,
    Resolved Entity,
    Entity Group,
    Enforce Bracketing,
    Entity Type,
    HTML Color,
    Maximum Correction
    Distance,
    Minimum Corrected Entity Length,
    Minimum Entity Length,
    Source`



  })
});
