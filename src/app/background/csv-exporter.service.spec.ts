import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {CSVEntity, CsvExporterService} from './csv-exporter.service';
import {HttpClient, HttpHandler} from '@angular/common/http';
import {BackgroundComponent} from './background.component';
import {BrowserService} from '../browser.service';
import {TestBrowserService} from '../test-browser.service';
import {EntitiesService} from './entities.service';
import {SettingsService} from './settings.service';
import {LeadminerEntityWrapper, SynonymText, TabEntities, XPath} from '../../types';

describe('CsvExporterService', () => {
  let service: CsvExporterService;

  const headerText = `Synonym,Resolved Entity,Entity Group,Enforce Bracketing,Entity Type,HTML Color,Maximum Correction Distance,Minimum Corrected Entity Length,Minimum Entity Length,Source`;

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
    });
    service = TestBed.inject(CsvExporterService);
  }));


  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return a string containing column headers and relevant entity data', () => {
    const entity: CSVEntity = {
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
      synonyms: ['K12'],
      identifiers: new Map([['resolvedEntity', 'HGNC:6414']]),
    };
    const entities: Array<CSVEntity> = [entity];
    const actual = service.leadmineToCSV(entities);

    const entityInfo = `"K12",HGNC:6414,Gene or Protein,false,GeneOrProteinMDC,pink,0,9,0,/srv/config/common/mdc/dictionary/mdc_gene_protein.cfx`;
    const expected = headerText + '\n' + entityInfo + '\n';

    expect(actual).toEqual(expected);

  });
});
