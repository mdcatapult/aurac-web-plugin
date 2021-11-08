import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ChangeIdentifier, RecogniserEntities, RecogniserID, LeadminerEntityWrapper, EntityChange, TabEntities, EntityID, SetterInfo } from '../../types'

@Injectable({
  providedIn: 'root'
})
export class EntitiesService {

  private entityMap: Map<number, TabEntities> = new Map()

  private readonly entityChangeSubject = new Subject<EntityChange>()
  readonly entityChangeObservable = this.entityChangeSubject.asObservable()

  constructor() { }

  getTabEntities(tab: number): TabEntities | undefined {
    return this.entityMap.get(tab)
  }

  setTabEntities(tab: number, entities: TabEntities, setterInfo?: SetterInfo): void {
    this.entityMap.set(tab, entities)
    this.updateStream({tab: tab}, entities, setterInfo)
  }

  getRecogniserEntities(id: RecogniserID): RecogniserEntities | undefined {
    const dictEntities = this.entityMap.get(id.tab)
    return dictEntities ? dictEntities[id.recogniser] : undefined
  }

  setRecogniserEntities(id: RecogniserID, entities: RecogniserEntities, setterInfo?: SetterInfo): void {
    const tabEntities = this.entityMap.get(id.tab)

    if (!tabEntities) {
      const newTabEntities: TabEntities = {}
      newTabEntities[id.recogniser] = entities
      this.entityMap.set(id.tab, newTabEntities)
      this.updateStream(id, newTabEntities, setterInfo)
    } else {
      tabEntities[id.recogniser] = entities
      this.entityMap.set(id.tab, tabEntities)
      this.updateStream(id, tabEntities, setterInfo)
    }
  }

  getEntity(id: EntityID): LeadminerEntityWrapper | undefined {
    const tabEntities = this.entityMap.get(id.tab)
    return tabEntities ? tabEntities[id.recogniser]?.entities?.get(id.identifier) : undefined
  }

  private updateStream(identifier: ChangeIdentifier, result: TabEntities | RecogniserEntities | LeadminerEntityWrapper | Map<string,LeadminerEntityWrapper>, setterInfo?: SetterInfo): void {
    this.entityChangeSubject.next({identifier, result, setterInfo: setterInfo})
  }
}
