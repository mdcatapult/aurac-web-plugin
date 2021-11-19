import { HttpClientTestingModule } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { Entity, TabEntities, TabID } from 'src/types/entity'
import { BrowserService } from '../browser.service'
import { TestBrowserService } from '../test-browser.service'

import { EntitiesService } from './entities.service'

fdescribe('EntitiesService', () => {
  let service: EntitiesService

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        EntitiesService,  
        { provide: BrowserService, useClass: TestBrowserService }
      ]
    })
    service = TestBed.inject(EntitiesService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('filter entities', () => {

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

    it('should contain neither synonym when min entity length is 7', () => {
      const minEntityLength = -1 
      const filteredEntities = service.filterEntities(minEntityLength)
      expect(getNumberOfSynonyms(filteredEntities)).toBe(2)
    })

    function getNumberOfSynonyms(entityMap: Map<TabID, TabEntities>): number {
      return entityMap.get(tabID)['leadmine-proteins'].entities.get(entityName)!.synonymToXPaths.size
    }
  })


})
