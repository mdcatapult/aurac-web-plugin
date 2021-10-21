import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ChangeIdentifier, DictionaryEntities, DictionaryID, Entity, EntityChange, LeadminerEntity, TabEntities } from '../../types'

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

  getDictionaryEntities(id: DictionaryID): DictionaryEntities | undefined {
    const dictEntities = this._entityMap.get(id.tab)
    return dictEntities ? dictEntities[id.dictionary] : undefined
  }

  setDictionaryEntities(id: DictionaryID, entities: DictionaryEntities): void {
    const tabEntities = this._entityMap.get(id.tab)
    
    if (!tabEntities) { 
      this._entityMap.set(id.tab, {[id.dictionary]: entities})
    } else {
      tabEntities[id.dictionary] = entities
      this._entityMap.set(id.tab, tabEntities)
    }
  
    this.updateStream(id, entities)
  }

  private updateStream(identifier: ChangeIdentifier, result: TabEntities | DictionaryEntities | Entity | Map<string,LeadminerEntity>): void {
    this._changeStream.next({identifier, result})
  }
}
