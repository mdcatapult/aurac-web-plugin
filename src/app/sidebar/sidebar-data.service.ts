import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { parseWithTypes } from 'src/json';
import { MessageType, ClickedHighlightData } from 'src/types/types';
import { BrowserService } from '../browser.service';
import { Identifier, SidebarEntity } from './types';

@Injectable({
  providedIn: 'root'
})
export class SidebarDataService {

  private entitiesBehaviorSubject: BehaviorSubject<Array<SidebarEntity>> = new BehaviorSubject(new Array<SidebarEntity>())
  readonly entitiesObservable: Observable<Array<SidebarEntity>> = this.entitiesBehaviorSubject.asObservable()

  get entities(): Array<SidebarEntity> {
    return this.entitiesBehaviorSubject.getValue()
  }
  setEntities(entities: Array<SidebarEntity>) {
    this.entitiesBehaviorSubject.next(entities)
  }


  constructor(private browserService: BrowserService) {
    this.browserService.addListener((msg: any) => {
    switch (msg.type as MessageType) {
      case 'sidebar_data_service_view_or_create_clicked_entity':
        const highlightData = parseWithTypes(msg.body) as ClickedHighlightData
        this.viewOrCreateClickedEntity(highlightData)
    }
  })}

  private sidebarEntityFromHighlightData(highlightData: ClickedHighlightData): SidebarEntity {
    const identifiersMap = highlightData.entity.identifierSourceToID
    let identifiers: Array<Identifier> = []

    if (identifiersMap) {
      identifiers = Array.from(identifiersMap.entries()).map(([type, value]) => {
        return {type, value}
      })
    }

    return {
      title: highlightData.clickedSynonymName,
      entityName: highlightData.entityName,
      identifiers,
      synonyms: Array.from(highlightData.entity.synonymToXPaths.keys()),
      occurrences: highlightData.entity.htmlTagIDs!,
      xrefs: highlightData.entity.xRefs,
      metadata: highlightData.entity.metadata
    }
  }

  private viewOrCreateClickedEntity(clickedHighlightData: ClickedHighlightData): void {
    // convert inspected highlight data into sidebar entity (check if it's already in the array etc.)
    // and manipulate the entities array to render the cards

    const cardExists = this.entities.some(entity => entity.entityName === clickedHighlightData.entityName)
    if (!cardExists) {
      this.setEntities(this.entities.concat([this.sidebarEntityFromHighlightData(clickedHighlightData)]))
    }
  }

}
