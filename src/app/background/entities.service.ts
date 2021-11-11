import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { RecogniserEntities, Entity, EntityChange, TabEntities, EntityID, SetterInfo, Recogniser } from '../../types'

type TabID = number

@Injectable({
  providedIn: 'root'
})
export class EntitiesService {

  private entityMap: Map<TabID, TabEntities> = new Map()

  private readonly entityChangeSubject = new Subject<EntityChange>()
  readonly entityChangeObservable = this.entityChangeSubject.asObservable()

  constructor() { }

  getTabEntities(tab: TabID): TabEntities | undefined {
    return this.entityMap.get(tab)
  }

  setTabEntities(tabID: TabID, entities: TabEntities, setterInfo?: SetterInfo): void {
    this.entityMap.set(tabID, entities)
    this.updateStream(tabID, entities, setterInfo)
  }

  getRecogniserEntities(tabID: TabID, recogniser: Recogniser): RecogniserEntities | undefined {
    const dictEntities = this.entityMap.get(tabID)
    return dictEntities ? dictEntities[recogniser] : undefined
  }

  setRecogniserEntities(tabID: TabID, recogniser: Recogniser, entities: RecogniserEntities, setterInfo?: SetterInfo): void {
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
    this.entityChangeSubject.next({tabID, entities, setterInfo: setterInfo})
  }
}
