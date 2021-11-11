import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { parseWithTypes } from 'src/json';
import { MessageType, ClickedHighlightData } from 'src/types';
import { BrowserService } from '../browser.service';
import { LinksService } from './links.service';
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


  constructor(private browserService: BrowserService, private linksService: LinksService) {    
    this.browserService.addListener((msg: any) => {
    switch (msg.type as MessageType) {
      case 'sidebar_data_service_view_or_create_clicked_entity':
        const highlightData = parseWithTypes(msg.body) as ClickedHighlightData
        this.viewOrCreateClickedEntity(highlightData)
    }
  })}

  private sidebarEntityFromHighlightData(highlightData: ClickedHighlightData): SidebarEntity {
    const identifiersMap = highlightData.entity.identifiers
    let identifiers: Array<Identifier> = []

    if (identifiersMap) {
      identifiers = Array.from(identifiersMap.entries()).map(([type, value]) => {
        return {type, value}
      })
    }

    const links = this.linksService.getLinks(highlightData.entity, highlightData.clickedSynonymName)

    return {
      title: highlightData.clickedSynonymName,
      entityID: highlightData.clickedEntityID,
      identifiers,
      synonyms: Array.from(highlightData.entity.synonyms.keys()),
      occurrences: highlightData.entity.htmlTagIDs!,
      xrefs: highlightData.entity.xRefs,
      links
    }
  }

  private viewOrCreateClickedEntity(clickedHighlightData: ClickedHighlightData): void {
    // convert inspected highlight data into sidebar entity (check if it's already in the array etc.)
    // and manipulate the entities array to render the cards

    const cardExists = this.entities.some(entity => entity.entityID === clickedHighlightData.clickedEntityID)
    if (!cardExists) {
      this.setEntities(this.entities.concat([this.sidebarEntityFromHighlightData(clickedHighlightData)]))
    }
  }

}
