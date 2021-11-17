import { Injectable } from '@angular/core'
import { min } from 'lodash'
import { Subject } from 'rxjs'
import { Recogniser } from 'src/types/recognisers'
import {
  Entity,
  EntityChange,
  EntityID,
  RecogniserEntities,
  SetterInfo,
  TabEntities,
  TabID
} from '../../types/entity'

@Injectable({
  providedIn: 'root'
})
export class EntitiesService {
  private entityMap: Map<TabID, TabEntities> = new Map()

  private readonly entityChangeSubject = new Subject<EntityChange>()
  readonly entityChangeObservable = this.entityChangeSubject.asObservable()

  constructor() {}

  getTabEntities(tab: TabID): TabEntities | undefined {
    return this.entityMap.get(tab)
  }

  setTabEntities(tabID: TabID, entities: TabEntities, setterInfo?: SetterInfo): void {
    this.entityMap.set(tabID, entities)
    this.updateStream(tabID, entities, setterInfo)
  }


  filterEntities(minEntityLength: number): void {

    const entityMap = {...this.entityMap}
    
    entityMap.forEach((tabEntities, tabId) => {

      // this will call highlightEntities in content script. There,we need to clear previous highlights.
      this.updateStream(tabId, this.filterTabEntities(minEntityLength, tabEntities))
    })
    //TODO: when we pass in SidebarEntity to sidebar on click, make sure the occurrence count will be correct.
  }


  // TODO: test
  private filterTabEntities(minEntityLength: number, tabEntities: TabEntities): TabEntities {

    Object.keys(tabEntities).forEach(recogniser => {
      const filteredEntities = new Map<string, Entity>()

      const recogniserEntities = tabEntities[`${recogniser}`] as RecogniserEntities
      recogniserEntities.entities.forEach((entity, entityName) => {
        if (entityName.length > minEntityLength) {
          filteredEntities.set(entityName, entity)
        }
      })
      tabEntities[`${recogniser}`] = filteredEntities
    })

    return tabEntities
  }

  getRecogniserEntities(tabID: TabID, recogniser: Recogniser): RecogniserEntities | undefined {
    const dictEntities = this.entityMap.get(tabID)

    return dictEntities ? dictEntities[recogniser] : undefined
  }

  setRecogniserEntities(
    tabID: TabID,
    recogniser: Recogniser,
    entities: RecogniserEntities,
    setterInfo?: SetterInfo
  ): void {
    const tabEntities = this.entityMap.get(tabID)

    if (!tabEntities) {
      const newTabEntities: TabEntities = {}
      newTabEntities[recogniser] = entities
      this.entityMap.set(tabID, newTabEntities)
      this.updateStream(tabID, newTabEntities, setterInfo)
    } else {
      tabEntities[recogniser] = entities
      this.entityMap.set(tabID, tabEntities)
      this.updateStream(tabID, tabEntities, setterInfo)
    }
  }

  getEntity(tabID: TabID, recogniser: Recogniser, entityID: EntityID): Entity | undefined {
    const tabEntities = this.entityMap.get(tabID)
 
    return tabEntities ? tabEntities[recogniser]?.entities?.get(entityID) : undefined
  }

  private updateStream(tabID: TabID, entities: TabEntities, setterInfo?: SetterInfo): void {
    this.entityChangeSubject.next({ tabID, entities, setterInfo: setterInfo })
  }
}
