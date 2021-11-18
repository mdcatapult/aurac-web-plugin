import { TestBed } from '@angular/core/testing'
import { min } from 'lodash'
import { Entity, EntityID, TabEntities, TabID } from 'src/types/entity'

import { EntitiesService } from './entities.service'

describe('EntitiesService', () => {
  let service: EntitiesService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(EntitiesService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  fdescribe('filter entities', () => {

    const tabID = 1
    const entityName = 'an-entity'
    const sixCharName = '123456'
    const fiveCharName = '12345'
    const entityMap = new Map<TabID, TabEntities>()
    entityMap.set(tabID, {
      'leadmine-proteins': {
        show: true,
        entities: new Map<string, Entity>([
          [entityName, {
            synonymToXPaths: new Map<string, string[]>([
              [sixCharName, []],
              [fiveCharName, []]
            ])
          }]
        ])
      }
    })
    service['entityMap'] = entityMap

    it('should filter entities', () => {
  
      let minEntityLength = 6
      let filteredEntities = service.filterEntities(minEntityLength)
      expect(getNumberOfSynonyms(filteredEntities)).toBe(2) // should contain both five and six char synomyms

      minEntityLength = 5 
      filteredEntities = service.filterEntities(minEntityLength)
      expect(getNumberOfSynonyms(filteredEntities)).toBe(1) // should only contain five char synonym

      minEntityLength = 4 
      filteredEntities = service.filterEntities(minEntityLength)
      expect(getNumberOfSynonyms(filteredEntities)).toBe(0) // should contain neither synonym

      minEntityLength = 0 
      filteredEntities = service.filterEntities(minEntityLength)
      expect(getNumberOfSynonyms(filteredEntities)).toBe(0) // should contain neither synonym

      minEntityLength = -1 
      filteredEntities = service.filterEntities(minEntityLength)
      expect(getNumberOfSynonyms(filteredEntities)).toBe(0) // should contain neither synonym

    })

    function getNumberOfSynonyms(entityMap: Map<TabID, TabEntities>): number {
      return entityMap.get(tabID)['leadmine-proteins'].entities.get(entityName)!.synonymToXPaths.size
    }
  })
})
