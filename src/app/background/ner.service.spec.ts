import { TestBed } from '@angular/core/testing';
import { Entity, RecogniserEntities, SynonymData, SynonymText } from 'src/types/types';
import { BrowserService } from '../browser.service';
import { TestBrowserService } from '../test-browser.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { NerService, APIRecognisedEntity } from './ner.service';
import { HttpHeaders, HttpParams } from '@angular/common/http';

describe('NerService', () => {
  let service: NerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: BrowserService, useClass: TestBrowserService },
      ]
    });
    service = TestBed.inject(NerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create an entity from an API response entity', () => {
    const recognisedEntity: APIRecognisedEntity = {
      entity: "Gene name",
      position: 5,
      xpath: "/html/*[1]/*[1]",
      recogniser: "leadmine-proteins",
      identifiers: { "resolvedEntity": "HGNC:8544" },
      metadata: 'eyJlbnRpdHlHcm91cCI6IkdlbmUgb3IgUHJvdGVpbiIsInJlY29nbmlzaW5nRGljdCI6eyJlbmZvcmNlQnJhY2tldGluZyI6ZmFsc2UsImVudGl0eVR5cGUiOiJHZW5lIiwiaHRtbENvbG9yIjoiYmx1ZSIsIm1heENvcnJlY3Rpb25EaXN0YW5jZSI6MSwibWluaW11bUNvcnJlY3RlZEVudGl0eUxlbmd0aCI6NCwibWluaW11bUVudGl0eUxlbmd0aCI6Niwic291cmNlIjoiL3Nydi9jb25maWcvZ2VuZXMuY2Z4In19Cg=='
    }
    const entity: Entity = {
      synonymToXPaths: new Map([["Gene name", { xpaths: ["/html/*[1]/*[1]"] }]]),
      identifierSourceToID: new Map([["resolvedEntity", "HGNC:8544"]]),
      metadata: {
        entityGroup: "Gene or Protein",
        recognisingDict: {
          "enforceBracketing": false,
          "entityType": "Gene",
          "htmlColor": "blue",
          "maxCorrectionDistance": 1,
          "minimumCorrectedEntityLength": 4,
          "minimumEntityLength": 6,
          "source": "/srv/config/genes.cfx"
        }
      },
    }

    expect(service["entityFromRecognisedEntity"](recognisedEntity)).toEqual(entity)
  })

  describe('setOrUpdateEntity', () => {
    let recogniserEntities = {} as RecogniserEntities
    beforeEach(() => {
      recogniserEntities = {
        show: true,
        entities: new Map<string, Entity>([["HGNC:8644", {
          synonymToXPaths: new Map<string, SynonymData>([["existing synonym", { xpaths: ["/html/*[1]"] }]])
        }]])
      }
    })


    it('should add new entity when entity is different', () => {
      const expectedRecogniserEntities = {
        show: true,
        entities: new Map<string, Entity>([
          ["HGNC:8644", { synonymToXPaths: new Map<string, SynonymData>([["existing synonym", { xpaths: ["/html/*[1]"] }]]) }],
          ["HGNC:8744", { synonymToXPaths: new Map<string, SynonymData>([["new synonym", { xpaths: ["/html/*[2]"] }]]) }]
        ])
      }
      service["setOrUpdateEntity"](recogniserEntities, "HGNC:8744", {
        entity: "new synonym",
        position: 3,
        xpath: "/html/*[2]",
        recogniser: 'leadmine-proteins'
      })

      expect(recogniserEntities).toEqual(expectedRecogniserEntities)
    })

    it('should append a synonym when the entity is the same', () => {
      const expectedRecogniserEntities = {
        show: true,
        entities: new Map<string, Entity>([
          ["HGNC:8644", { synonymToXPaths: new Map<string, SynonymData>([["existing synonym", { xpaths: ["/html/*[1]"] }], ["new synonym", { xpaths: ["/html/*[2]"] }]]) }]
        ])
      }
      service["setOrUpdateEntity"](recogniserEntities, "HGNC:8644", {
        entity: "new synonym",
        position: 3,
        xpath: "/html/*[2]",
        recogniser: 'leadmine-proteins'
      })

      expect(recogniserEntities).toEqual(expectedRecogniserEntities)
    })

    it('should append an xpath when the entity and synonym are the same', () => {
      const expectedRecogniserEntities = {
        show: true,
        entities: new Map<string, Entity>([
          ["HGNC:8644", { synonymToXPaths: new Map<string, SynonymData>([["existing synonym", { xpaths: ["/html/*[1]", "/html/*[2]"] }]]) }]
        ])
      }
      service["setOrUpdateEntity"](recogniserEntities, "HGNC:8644", {
        entity: "existing synonym",
        position: 3,
        xpath: "/html/*[2]",
        recogniser: 'leadmine-proteins'
      })

      expect(recogniserEntities).toEqual(expectedRecogniserEntities)
    })

  })

  describe('transformAPIResponse', () => {

    it('transform a response from the ner api into a tab entities map', () => {
      const recognisedEntities: APIRecognisedEntity[] = [
        {
          entity: "entity1",
          position: 2,
          xpath: "/html/*[1]",
          recogniser: "leadmine-proteins",
          identifiers: { resolvedEntity: "HGNC:8644" }
        },
        {
          entity: "entity2",
          position: 2,
          xpath: "/html/*[2]",
          recogniser: "leadmine-proteins",
          identifiers: { resolvedEntity: "HGNC:8644" }
        },
        {
          entity: "entity3",
          position: 2,
          xpath: "/html/*[3]",
          recogniser: "leadmine-proteins",
          identifiers: { resolvedEntity: "" }
        },
        {
          entity: "ENTITY3",
          position: 2,
          xpath: "/html/*[4]",
          recogniser: "leadmine-proteins",
          identifiers: { resolvedEntity: "" }
        },
        {
          entity: "entity5",
          position: 2,
          xpath: "/html/*[5]",
          recogniser: "leadmine-proteins",
          identifiers: { resolvedEntity: "" }
        },
        {
          entity: "entity6",
          position: 2,
          xpath: "/html/*[6]",
          recogniser: "leadmine-proteins",
          identifiers: { resolvedEntity: "HGNC:8633" }
        },
        {
          entity: "entity1",
          position: 2,
          xpath: "/html/*[7]",
          recogniser: "leadmine-proteins",
          identifiers: { resolvedEntity: "HGNC:8644" }
        },
      ]

      const recogniserEntities: RecogniserEntities = {
        show: true,
        // entities: new Map<string,Entity>([["s", {synonyms: }]])
        entities: new Map<string, Entity>([
          ["HGNC:8644", {
            synonymToXPaths: new Map<SynonymText, SynonymData>([
              ["entity1", { xpaths: ["/html/*[1]", "/html/*[7]"]}],
              ["entity2", { xpaths: ["/html/*[2]"] }]
            ]),
            identifierSourceToID: new Map<string,string>([["resolvedEntity", "HGNC:8644"]])
          }],
          ["HGNC:8633", {
            synonymToXPaths: new Map<SynonymText, SynonymData>([
              ["entity6", { xpaths: ["/html/*[6]"] }]
            ]),
            identifierSourceToID: new Map<string,string>([["resolvedEntity", "HGNC:8633"]])
          }],
          ["entity3", {
            synonymToXPaths: new Map<SynonymText, SynonymData>([
              ["entity3", { xpaths: ["/html/*[3]"] }],
              ["ENTITY3", { xpaths: ["/html/*[4]"] }]
            ]),
            identifierSourceToID: new Map<string,string>([["resolvedEntity", ""]])
          }],
          ["entity5", {
            synonymToXPaths: new Map<SynonymText, SynonymData>([
              ["entity5", { xpaths: ["/html/*[5]"] }]
            ]),
            identifierSourceToID: new Map<string,string>([["resolvedEntity", ""]])
          }]
        ])
      }

      expect(service["transformAPIResponse"](recognisedEntities)).toEqual(recogniserEntities)
    })
  })

  it('should construct correct query parameters and headers', () => {
    const [leadmineProteinParams, leadmineProteinHeaders] = service["constructRequestParametersAndHeaders"]('leadmine-proteins')
    expect(leadmineProteinParams.toString()).toEqual('recogniser=leadmine-proteins')
    expect(leadmineProteinHeaders).toEqual(new HttpHeaders())


    let [leadmineDiseasesParams, leadmineDiseasesHeaders] = service["constructRequestParametersAndHeaders"]('leadmine-diseases')
    expect(leadmineDiseasesParams.toString()).toEqual('recogniser=leadmine-diseases')
    expect(leadmineDiseasesHeaders).toEqual(new HttpHeaders())


    let [params, headers] = service["constructRequestParametersAndHeaders"]('leadmine-chemical-entities')
    expect(params.toString()).toEqual('recogniser=leadmine-chemical-entities')
    expect(headers.get('x-leadmine-chemical-entities')).toEqual('eyJxdWVyeVBhcmFtZXRlcnMiOnsiaW5jaGkiOlsidHJ1ZSJdfX0=')
  })

});
