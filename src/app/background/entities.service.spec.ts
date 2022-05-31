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

import { HttpClientTestingModule } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { Entity, TabEntities, TabID } from 'src/types/entity'
import { BrowserService } from '../browser.service'
import { TestBrowserService } from '../test-browser.service'

import { EntitiesService } from './entities.service'

describe('EntitiesService', () => {
  let service: EntitiesService

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EntitiesService, { provide: BrowserService, useClass: TestBrowserService }]
    })
    service = TestBed.inject(EntitiesService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('filter entities', () => {
    describe('minimum entity length', () => {
      const tabID = 1
      const entityName = 'an-entity'
      const sixCharName = '123456'
      const fiveCharName = '12345'
      const entityMap = new Map<TabID, TabEntities>()

      beforeEach(() => {
        entityMap.set(tabID, {
          'leadmine-proteins': {
            show: true,
            entities: new Map<string, Entity>([
              [
                entityName,
                {
                  synonymToXPaths: new Map<string, string[]>([
                    [sixCharName, []],
                    [fiveCharName, []]
                  ])
                }
              ]
            ])
          }
        })

        service['entityMap'] = entityMap
      })

      it('should contain neither synonym when min entity length is 7', () => {
        const minEntityLength = 7
        const filteredEntities = service.filterEntities(minEntityLength)
        expect(getNumberOfSynonyms(filteredEntities)).toBe(0)
      })

      it('should contain only six char synonym when min entity length is 6', () => {
        const minEntityLength = 6
        const filteredEntities = service.filterEntities(minEntityLength)
        expect(getNumberOfSynonyms(filteredEntities)).toBe(1)
      })

      it('should contain five and six char synonyms when min entity length is 5', () => {
        const minEntityLength = 5
        const filteredEntities = service.filterEntities(minEntityLength)
        expect(getNumberOfSynonyms(filteredEntities)).toBe(2)
      })

      it('should contain five and six char synonyms when min entity length is 0', () => {
        const minEntityLength = 0
        const filteredEntities = service.filterEntities(minEntityLength)
        expect(getNumberOfSynonyms(filteredEntities)).toBe(2)
      })

      it('should contain five and six char synonms when min entity length is negative', () => {
        const minEntityLength = -1
        const filteredEntities = service.filterEntities(minEntityLength)
        expect(getNumberOfSynonyms(filteredEntities)).toBe(2)
      })

      function getNumberOfSynonyms(entityMap: Map<TabID, TabEntities>): number {
        return entityMap.get(tabID)['leadmine-proteins'].entities.get(entityName)!.synonymToXPaths
          .size
      }
    })

    describe('species', () => {
      const tabID = 1
      const entityName = 'an-entity'
      const entityName2 = 'another-entity'
      const entityMap = new Map<TabID, TabEntities>()

      beforeEach(() => {
        entityMap.set(tabID, {
          'swissprot-genes-proteins': {
            show: true,
            entities: new Map<string, Entity>([
              [
                entityName,
                {
                  synonymToXPaths: new Map<string, string[]>([
                    [entityName, []],
                    ['averyverylongsynonym', []]
                  ]),
                  speciesNames: ['Homo sapiens']
                }
              ],
              [
                entityName2,
                {
                  synonymToXPaths: new Map<string, string[]>([[entityName2, []]]),
                  speciesNames: ['Mus musculus']
                }
              ]
            ])
          }
        })
        service['entityMap'] = entityMap
      })

      it('should return a single entity when species is "Homo sapiens"', () => {
        const minEntityLength = 1
        const species = 'Homo sapiens'
        const filteredTabEntities = service.filterEntities(minEntityLength, species)
        const filteredEntities = filteredTabEntities.get(tabID)['swissprot-genes-proteins'].entities
        expect(filteredEntities.size === 1)
        expect(filteredEntities.get(entityName).speciesNames[0] === 'Homo sapiens')
      })

      it('should return no entities when species is "Rattus norvegicus"', () => {
        const minEntityLength = 1
        const species = 'Rattus norvegicus'
        const filteredTabEntities = service.filterEntities(minEntityLength, species)
        const filteredEntities = filteredTabEntities.get(tabID)['swissprot-genes-proteins'].entities
        expect(filteredEntities.size === 0)
      })

      it('should return 2 entities when no species is specified', () => {
        const minEntityLength = 1
        const species = 'Homo sapiens'
        const filteredTabEntities = service.filterEntities(minEntityLength, species)
        const filteredEntities = filteredTabEntities.get(tabID)['swissprot-genes-proteins'].entities
        expect(filteredEntities.size === 2)
      })

      it('should return a single entity when species and minimum entity length are present', () => {
        const minEntityLength = 10
        const species = 'Homo sapiens'
        const filteredTabEntities = service.filterEntities(minEntityLength, species)
        const filteredEntities = filteredTabEntities.get(tabID)['swissprot-genes-proteins'].entities
        expect(filteredEntities.get(entityName).speciesNames[0] === 'Homo sapiens')
        expect(filteredEntities.get(entityName).synonymToXPaths.size === 1)
        expect(filteredEntities.get(entityName).synonymToXPaths.has('averyverylongsynonym'))
      })
    })
  })
})
