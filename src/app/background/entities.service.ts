import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ChangeIdentifier, RecogniserEntities, RecogniserID, Entity, EntityChange, TabEntities } from '../../types'

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

  setTabEntities(tab: number, entities: TabEntities): void {
    this._entityMap.set(tab, entities)
    this.updateStream(tab, entities)
  }

  getRecogniserEntities(id: RecogniserID): RecogniserEntities | undefined {
    const dictEntities = this._entityMap.get(id.tab)
    return dictEntities ? dictEntities[id.recogniser] : undefined
  }

  setRecogniserEntities(id: RecogniserID, entities: RecogniserEntities): void {
    const tabEntities = this._entityMap.get(id.tab)
    
    if (!tabEntities) { 
      const newTabEntities: TabEntities = {}
      newTabEntities[id.recogniser] = entities
      this._entityMap.set(id.tab, newTabEntities)
      this.updateStream(id.tab, newTabEntities)
    } else {
      tabEntities[id.recogniser] = entities
      this._entityMap.set(id.tab, tabEntities)
      this.updateStream(id, entities)
    }
  }

  private updateStream(identifier: ChangeIdentifier, result: TabEntities | RecogniserEntities | Entity | Map<string,Entity>): void {
    this._changeStream.next({identifier, result})
  }
}
