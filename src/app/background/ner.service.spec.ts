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

import { TestBed } from '@angular/core/testing'
import { Entity, RecogniserEntities } from 'src/types/entity'
import { BrowserService } from '../browser.service'
import { TestBrowserService } from '../test-browser.service'
import { HttpClientTestingModule } from '@angular/common/http/testing'

import { NerService, APIEntities, APIEntity } from './ner.service'

describe('NerService', () => {
  let service: NerService

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: BrowserService, useClass: TestBrowserService }]
    })
    service = TestBed.inject(NerService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should create an entity from an API response entity', () => {
    const recognisedEntity: APIEntity = {
      name: 'Gene name',
      positions: [
        {
          xpath: '/html/*[1]/*[1]',
          position: 5
        }
      ],
      recogniser: 'leadmine-proteins',
      identifiers: { resolvedEntity: 'HGNC:8544' },
      metadata:
        '{"entityGroup":"Gene or Protein","recognisingDict":{"enforceBracketing":false,"entityType":"Gene","htmlColor":"blue","maxCorrectionDistance":1,"minimumCorrectedEntityLength":4,"minimumEntityLength":6,"source":"/srv/config/genes.cfx"}}'
    }
    const entity: Entity = {
      synonymToXPaths: new Map([['Gene name', ['/html/*[1]/*[1]']]]),
      speciesNames: undefined,
      identifierSourceToID: new Map([['resolvedEntity', 'HGNC:8544']]),
      metadata: {
        entityGroup: 'Gene or Protein',
        recognisingDict: {
          enforceBracketing: false,
          entityType: 'Gene',
          htmlColor: 'blue',
          maxCorrectionDistance: 1,
          minimumCorrectedEntityLength: 4,
          minimumEntityLength: 6,
          source: '/srv/config/genes.cfx'
        }
      }
    }

    expect(service['entityFromAPIEntity'](recognisedEntity)).toEqual(entity)
  })

  describe('setOrUpdateEntity', () => {
    let recogniserEntities = {} as RecogniserEntities
    beforeEach(() => {
      recogniserEntities = {
        show: true,
        entities: new Map<string, Entity>([
          [
            'HGNC:8644',
            {
              synonymToXPaths: new Map<string, string[]>([['existing synonym', ['/html/*[1]']]]),
              speciesNames: undefined
            }
          ]
        ])
      }
    })

    it('should add new entity when entity is different', () => {
      const expectedRecogniserEntities = {
        show: true,
        entities: new Map<string, Entity>([
          [
            'HGNC:8644',
            {
              synonymToXPaths: new Map<string, string[]>([['existing synonym', ['/html/*[1]']]]),
              speciesNames: undefined
            }
          ],
          [
            'HGNC:8744',
            {
              synonymToXPaths: new Map<string, string[]>([['new synonym', ['/html/*[2]']]]),
              speciesNames: undefined
            }
          ]
        ])
      }
      service['setOrUpdateEntity'](recogniserEntities, 'HGNC:8744', {
        name: 'new synonym',
        positions: [
          {
            xpath: '/html/*[2]',
            position: 3
          }
        ],
        recogniser: 'leadmine-proteins'
      })

      expect(recogniserEntities).toEqual(expectedRecogniserEntities)
    })

    it('should append a synonym when the entity is the same', () => {
      const expectedRecogniserEntities = {
        show: true,
        entities: new Map<string, Entity>([
          [
            'HGNC:8644',
            {
              synonymToXPaths: new Map<string, string[]>([
                ['existing synonym', ['/html/*[1]']],
                ['new synonym', ['/html/*[2]']]
              ]),
              speciesNames: undefined
            }
          ]
        ])
      }
      service['setOrUpdateEntity'](recogniserEntities, 'HGNC:8644', {
        name: 'new synonym',
        positions: [
          {
            xpath: '/html/*[2]',
            position: 3
          }
        ],
        recogniser: 'leadmine-proteins'
      })

      expect(recogniserEntities).toEqual(expectedRecogniserEntities)
    })

    it('should append an xpath when the entity and synonym are the same', () => {
      const expectedRecogniserEntities = {
        show: true,
        entities: new Map<string, Entity>([
          [
            'HGNC:8644',
            {
              synonymToXPaths: new Map<string, string[]>([
                ['existing synonym', ['/html/*[1]', '/html/*[2]']]
              ]),
              speciesNames: undefined
            }
          ]
        ])
      }
      service['setOrUpdateEntity'](recogniserEntities, 'HGNC:8644', {
        name: 'existing synonym',
        positions: [
          {
            xpath: '/html/*[2]',
            position: 3
          }
        ],
        recogniser: 'leadmine-proteins'
      })

      expect(recogniserEntities).toEqual(expectedRecogniserEntities)
    })
  })

  describe('transformAPIResponse', () => {
    it('transform a response from the ner api into a tab entities map', () => {
      const recognisedEntities: APIEntities = [
        {
          name: 'entity1',
          positions: [
            {
              xpath: '/html/*[1]',
              position: 2
            }
          ],
          recogniser: 'leadmine-proteins',
          identifiers: { resolvedEntity: 'HGNC:8644' }
        },
        {
          name: 'entity2',
          positions: [
            {
              xpath: '/html/*[2]',
              position: 2
            }
          ],
          recogniser: 'leadmine-proteins',
          identifiers: { resolvedEntity: 'HGNC:8644' }
        },
        {
          name: 'entity3',
          positions: [
            {
              xpath: '/html/*[3]',
              position: 2
            }
          ],
          recogniser: 'leadmine-proteins',
          identifiers: { resolvedEntity: '' }
        },
        {
          name: 'ENTITY3',
          positions: [
            {
              xpath: '/html/*[4]',
              position: 2
            }
          ],
          recogniser: 'leadmine-proteins',
          identifiers: { resolvedEntity: '' }
        },
        {
          name: 'entity5',
          positions: [
            {
              xpath: '/html/*[5]',
              position: 2
            }
          ],
          recogniser: 'leadmine-proteins',
          identifiers: { resolvedEntity: '' }
        },
        {
          name: 'entity6',
          positions: [
            {
              xpath: '/html/*[6]',
              position: 2
            }
          ],
          recogniser: 'leadmine-proteins',
          identifiers: { resolvedEntity: 'HGNC:8633' }
        },
        {
          name: 'entity1',
          positions: [
            {
              xpath: '/html/*[7]',
              position: 2
            }
          ],
          recogniser: 'leadmine-proteins',
          identifiers: { resolvedEntity: 'HGNC:8644' }
        }
      ]

      const recogniserEntities: RecogniserEntities = {
        show: true,
        entities: new Map<string, Entity>([
          [
            'HGNC:8644',
            {
              synonymToXPaths: new Map<string, string[]>([
                ['entity1', ['/html/*[1]', '/html/*[7]']],
                ['entity2', ['/html/*[2]']]
              ]),
              speciesNames: undefined,
              identifierSourceToID: new Map<string, string>([['resolvedEntity', 'HGNC:8644']])
            }
          ],
          [
            'HGNC:8633',
            {
              synonymToXPaths: new Map<string, string[]>([['entity6', ['/html/*[6]']]]),
              speciesNames: undefined,
              identifierSourceToID: new Map<string, string>([['resolvedEntity', 'HGNC:8633']])
            }
          ],
          [
            'entity3',
            {
              synonymToXPaths: new Map<string, string[]>([
                ['entity3', ['/html/*[3]']],
                ['ENTITY3', ['/html/*[4]']]
              ]),
              speciesNames: undefined,
              identifierSourceToID: new Map<string, string>([['resolvedEntity', '']])
            }
          ],
          [
            'entity5',
            {
              synonymToXPaths: new Map<string, string[]>([['entity5', ['/html/*[5]']]]),
              speciesNames: undefined,
              identifierSourceToID: new Map<string, string>([['resolvedEntity', '']])
            }
          ]
        ])
      }

      expect(service['transformAPIResponse'](recognisedEntities, 0)).toEqual(recogniserEntities)
    })
  })

  it('should construct correct query parameters and headers', () => {
    const [leadmineProteinParams, leadmineProteinHeaders] =
      service['constructRequestParametersAndHeaders']('leadmine-proteins')
    expect(leadmineProteinParams.toString()).toEqual(
      'recogniser=leadmine-proteins&exact-match=true'
    )
    expect(leadmineProteinHeaders.get('content-type')).toEqual('text/html')

    let [leadmineDiseasesParams, leadmineDiseasesHeaders] =
      service['constructRequestParametersAndHeaders']('leadmine-disease')
    expect(leadmineDiseasesParams.toString()).toEqual(
      'recogniser=leadmine-disease&exact-match=true'
    )
    expect(leadmineDiseasesHeaders.get('content-type')).toEqual('text/html')

    let [params, headers] = service['constructRequestParametersAndHeaders'](
      'leadmine-chemical-entities'
    )
    expect(params.toString()).toEqual('recogniser=leadmine-chemical-entities&exact-match=true')
    expect(headers.get('content-type')).toEqual('text/html')
    expect(headers.get('x-leadmine-chemical-entities')).toEqual(
      'eyJxdWVyeVBhcmFtZXRlcnMiOnsiaW5jaGlrZXkiOlsidHJ1ZSJdfX0='
    )
  })
})
