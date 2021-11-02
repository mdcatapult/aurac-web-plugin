import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ChangeIdentifier, RecogniserEntities, RecogniserID, Entity, EntityChange, TabEntities, EntityID, SetterInfo } from '../../types'

@Injectable({
  providedIn: 'root'
})
export class EntitiesService {

  private _entityMap: Map<number, TabEntities> = new Map()

  private readonly _changeStream = new Subject<EntityChange>()
  readonly changeStream$ = this._changeStream.asObservable()

  constructor() { }

  getTabEntities(tab: number): TabEntities | undefined {
    return this._entityMap.get(tab)
  }

  setTabEntities(tab: number, entities: TabEntities, setterInfo?: SetterInfo): void {
    this._entityMap.set(tab, entities)
    this.updateStream(tab, entities, setterInfo)
  }

  getRecogniserEntities(id: RecogniserID): RecogniserEntities | undefined {
    const dictEntities = this._entityMap.get(id.tab)
    return dictEntities ? dictEntities[id.recogniser] : undefined
  }

  setRecogniserEntities(id: RecogniserID, entities: RecogniserEntities, setterInfo?: SetterInfo): void {
    const tabEntities = this._entityMap.get(id.tab)
    
    if (!tabEntities) { 
      const newTabEntities: TabEntities = {}
      newTabEntities[id.recogniser] = entities
      this._entityMap.set(id.tab, newTabEntities)
      this.updateStream(id.tab, newTabEntities, setterInfo)
    } else {
      tabEntities[id.recogniser] = entities
      this._entityMap.set(id.tab, tabEntities)
      this.updateStream(id, entities, setterInfo)
    }
  }

  getEntity(id: EntityID): Entity | undefined {
    const tabEntities = this._entityMap.get(id.tab)
    return tabEntities ? tabEntities[id.recogniser]?.entities?.get(id.identifier) : undefined
  }

  private updateStream(identifier: ChangeIdentifier, result: TabEntities | RecogniserEntities | Entity | Map<string,Entity>, setterInfo?: SetterInfo): void {
    this._changeStream.next({identifier, result, setterInfo: setterInfo})
  }
}
