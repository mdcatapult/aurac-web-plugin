import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { parseWithTypes } from 'src/json';
import { MessageType, InspectedHighlightData } from 'src/types';
import { BrowserService } from '../browser.service';
import { Identifier, SidebarEntity } from './types';

@Injectable({
  providedIn: 'root'
})
export class SidebarDataService {

  private _entities: BehaviorSubject<Array<SidebarEntity>> = new BehaviorSubject(new Array<SidebarEntity>())
  readonly entities$: Observable<Array<SidebarEntity>> = this._entities.asObservable()
  get entities(): Array<SidebarEntity> {
    return this._entities.getValue()
  }
  set entities(entities: Array<SidebarEntity>) {
    this._entities.next(entities)
  }


  constructor(private browserService: BrowserService) {    
    this.browserService.addListener((msg: any) => {
    switch (msg.type as MessageType) {
      case 'sidebar_data_service_inspect_highlight':
        const highlightData = parseWithTypes(msg.body) as InspectedHighlightData
        this.inspectHighlight(highlightData)
    }
  })}

  private inspectHighlight(inspectedHighlightData: InspectedHighlightData): void {
    // convert inspected highlight data into sidebar entity (check if it's already in the array etc.)
    // and manipulate the entities array to render the cards

    if (!this.entities.some(entity => entity.entityName === inspectedHighlightData.entityName)) {
      const identifiersMap = inspectedHighlightData.entity.identifiers
      let identifiers: Array<Identifier> = []

      if (identifiersMap) {
        identifiers = Array.from(identifiersMap.entries()).map(([type, value]) => {
          return {type, value}
        })
      }

      // entities is a copy
      const entities = this.entities
      
      entities.push({
          title: inspectedHighlightData.clickedSynonymName,
          entityName: inspectedHighlightData.entityName,
          identifiers,
          synonyms: Array.from(inspectedHighlightData.entity.synonyms.keys()),
          occurrences: inspectedHighlightData.entity.htmlTagIDs!
      })
      
      // this calls next on entities via the setter
      this.entities = entities
    }
  }

}
